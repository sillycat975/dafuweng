// 游戏状态机
window.Game = {
  players: [],
  currentPlayerIndex: 0,
  round: 1,
  gameOver: false,
  winner: null,
  // 回调：UI 层注册，用于刷新界面和提示
  onStateChange: null,
  onMessage: null,

  // 初始化游戏
  init() {
    Board.init();
    this.players = [
      new Player('p1', '玩家', false),
      new Player('p2', 'AI', true)
    ];
    this.currentPlayerIndex = 0;
    this.round = 1;
    this.gameOver = false;
    this.winner = null;
    this.emitState();
  },

  currentPlayer() {
    return this.players[this.currentPlayerIndex];
  },

  // 判断玩家是否拥有某颜色组的全部地产
  ownsColorGroup(player, color) {
    const group = GameConfig.COLOR_GROUPS[color];
    if (!group) return false;
    return group.every(idx => player.owns(idx));
  },

  // 计算某地产的租金（考虑成套与房屋数）
  getRent(cell, owner) {
    if (cell.type !== 'property') return 0;
    const houseCount = owner.getHouses(cell.index);
    if (houseCount > 0) {
      return cell.rents[houseCount];
    }
    // 无房：若拥有整套颜色组，租金翻倍
    if (this.ownsColorGroup(owner, cell.color)) {
      return cell.rents[0] * 2;
    }
    return cell.rents[0];
  },

  // 判断玩家是否可以在某地产建房
  canBuildHouse(player, cellIndex) {
    const cell = Board.cells[cellIndex];
    if (cell.type !== 'property' || cell.owner !== player.id) return false;
    if (!this.ownsColorGroup(player, cell.color)) return false;
    if (player.getHouses(cellIndex) >= GameConfig.MAX_HOUSES) return false;
    if (player.money < cell.housePrice) return false;
    // 均衡建房规则：同组内房屋数差不能超过 1（只能在房屋数最少的地产上建）
    const group = GameConfig.COLOR_GROUPS[cell.color];
    const minHouses = Math.min(...group.map(i => player.getHouses(i)));
    if (player.getHouses(cellIndex) > minHouses) return false;
    return true;
  },

  // 人类玩家在当前地产建房
  humanBuildHouse() {
    if (this.gameOver) return;
    const player = this.currentPlayer();
    if (player.isAI) return;
    this.buildHouse(player, player.position);
    this.emitState();
  },

  // 在某地产建一栋房
  buildHouse(player, cellIndex) {
    const cell = Board.cells[cellIndex];
    if (!this.canBuildHouse(player, cellIndex)) {
      this.message('不满足建房条件');
      return false;
    }
    if (player.buildHouse(cellIndex, cell.housePrice)) {
      const count = player.getHouses(cellIndex);
      const label = count >= 5 ? '旅馆' : `${count} 栋房屋`;
      this.message(`${player.name} 在 ${cell.name} 建了 ${label}，花费 ￥${cell.housePrice}`);
      return true;
    }
    return false;
  },

  // 掷骰并执行回合（人类玩家调用）
  humanRoll() {
    if (this.gameOver) return;
    const player = this.currentPlayer();
    if (player.isAI) return; // 不应由人类触发 AI 回合
    this.executeRoll(player);
  },

  // 人类玩家购买当前地产
  humanBuy() {
    if (this.gameOver) return;
    const player = this.currentPlayer();
    if (player.isAI) return;
    const cell = Board.cells[player.position];
    if (cell.type !== 'property' || cell.owner) return;
    this.buyProperty(player, cell);
    this.emitState();
  },

  // 人类玩家结束回合（放弃购买等情况）
  humanEndTurn() {
    if (this.gameOver) return;
    const player = this.currentPlayer();
    if (player.isAI) return;
    this.nextTurn();
  },

  // 执行掷骰与移动
  executeRoll(player) {
    const dice = Dice.roll();
    this.message(`${player.name} 掷出 ${dice.d1} + ${dice.d2} = ${dice.total}`);

    const passedStart = player.move(dice.total);
    if (passedStart) {
      player.earn(GameConfig.START_REWARD);
      this.message(`${player.name} 经过起点，获得 ￥${GameConfig.START_REWARD}`);
    }

    const cell = Board.cells[player.position];
    this.message(`${player.name} 到达【${cell.name}】`);

    this.emitState();

    // 处理格子事件，使用延时让玩家看到移动结果
    setTimeout(() => this.handleCell(player, cell), 400);
  },

  // 处理落地格子
  handleCell(player, cell) {
    if (this.gameOver) return;

    if (cell.type === 'property') {
      if (!cell.owner) {
        // 无主地产
        if (player.isAI) {
          if (AI.decideBuy(player, cell)) {
            this.buyProperty(player, cell);
          } else {
            this.message(`${player.name} 放弃购买 ${cell.name}`);
          }
          this.emitState();
          setTimeout(() => this.nextTurn(), 600);
        }
        // 人类玩家由 UI 显示购买按钮，等待操作
      } else if (cell.owner === player.id) {
        const canBuild = this.canBuildHouse(player, cell.index);
        if (player.isAI) {
          // AI：若满足条件则建一栋房
          if (AI.decideBuild(player, cell) && canBuild) {
            this.buildHouse(player, cell.index);
          }
          this.emitState();
          setTimeout(() => this.nextTurn(), 600);
        } else {
          this.message(`${cell.name} 是 ${player.name} 自己的地产${canBuild ? '，可以建房' : ''}`);
          this.emitState();
        }
      } else {
        // 他人地产，付租金
        const owner = this.players.find(p => p.id === cell.owner);
        const rent = this.getRent(cell, owner);
        const paid = player.pay(rent);
        owner.earn(paid);
        const houseCount = owner.getHouses(cell.index);
        const houseInfo = houseCount > 0 ? `（${houseCount >= 5 ? '旅馆' : houseCount + '栋房'}）` : '';
        this.message(`${player.name} 向 ${owner.name} 支付租金 ￥${paid}${houseInfo}`);
        this.checkBankruptcy(player);
        this.emitState();
        if (!this.gameOver && player.isAI) setTimeout(() => this.nextTurn(), 600);
      }
    } else {
      // 起点或空白格
      if (cell.type === 'empty') {
        this.message(`${cell.name}，什么都没发生`);
      }
      this.emitState();
      if (player.isAI) setTimeout(() => this.nextTurn(), 600);
    }
  },

  // 购买地产
  buyProperty(player, cell) {
    if (player.buyProperty(cell.index, cell.price)) {
      cell.owner = player.id;
      this.message(`${player.name} 购买了 ${cell.name}，花费 ￥${cell.price}`);
    } else {
      this.message(`${player.name} 资金不足，无法购买 ${cell.name}`);
    }
  },

  // 检查破产
  checkBankruptcy(player) {
    if (player.isBankrupt) {
      this.message(`${player.name} 破产了！`);
      // 将其地产归还给系统（无主），并清除房屋
      [...player.properties].forEach(idx => {
        Board.cells[idx].owner = null;
        player.removeProperty(idx);
      });
      this.checkWin();
    }
  },

  // 检查胜负
  checkWin() {
    const alive = this.players.filter(p => !p.isBankrupt);
    if (alive.length <= 1) {
      this.gameOver = true;
      this.winner = alive[0] || null;
      if (this.winner) {
        this.message(`游戏结束！${this.winner.name} 获胜！`);
      }
    }
  },

  // 切换到下一个玩家
  nextTurn() {
    if (this.gameOver) return;
    // 找到下一个未破产的玩家
    let next = (this.currentPlayerIndex + 1) % this.players.length;
    let attempts = 0;
    while (this.players[next].isBankrupt && attempts < this.players.length) {
      next = (next + 1) % this.players.length;
      attempts++;
    }
    this.currentPlayerIndex = next;

    // 如果回到第一个玩家，回合数 +1
    if (next === 0) this.round++;

    this.emitState();

    // AI 自动进行
    const player = this.currentPlayer();
    if (player.isAI && !this.gameOver) {
      setTimeout(() => this.executeRoll(player), 700);
    }
  },

  // 触发状态刷新
  emitState() {
    if (this.onStateChange) this.onStateChange();
  },

  // 输出消息
  message(text) {
    if (this.onMessage) this.onMessage(text);
  }
};
