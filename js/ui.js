// UI 交互层
(function () {
  const boardEl = document.getElementById('board');
  const rollBtn = document.getElementById('btn-roll');
  const buyBtn = document.getElementById('btn-buy');
  const buildBtn = document.getElementById('btn-build');
  const endTurnBtn = document.getElementById('btn-end');
  const restartBtn = document.getElementById('btn-restart');
  const messageEl = document.getElementById('message');
  const roundEl = document.getElementById('round');
  const playersEl = document.getElementById('players');

  // 注册回调
  Game.onStateChange = render;
  Game.onMessage = showMessage;

  // 按钮事件
  rollBtn.addEventListener('click', () => Game.humanRoll());
  buyBtn.addEventListener('click', () => {
    Game.humanBuy();
    // 购买后不自动结束回合，玩家可选择建房或手动结束
  });
  buildBtn.addEventListener('click', () => Game.humanBuildHouse());
  endTurnBtn.addEventListener('click', () => Game.humanEndTurn());
  restartBtn.addEventListener('click', () => {
    Game.init();
    messageEl.textContent = '游戏开始！点击"掷骰"开始你的回合。';
  });

  // 渲染整个界面
  function render() {
    // 棋盘
    Board.render(boardEl, Game.players);

    // 回合数
    roundEl.textContent = `第 ${Game.round} 回合`;

    // 玩家面板
    renderPlayers();

    // 按钮状态
    updateButtons();

    // 游戏结束
    if (Game.gameOver) {
      rollBtn.disabled = true;
      buyBtn.disabled = true;
      buildBtn.disabled = true;
      endTurnBtn.disabled = true;
    }
  }

  // 渲染玩家面板
  function renderPlayers() {
    playersEl.innerHTML = '';
    Game.players.forEach(player => {
      const panel = document.createElement('div');
      panel.className = 'player-panel' + (player.isBankrupt ? ' bankrupt' : '');
      if (player.id === Game.currentPlayer().id && !Game.gameOver) {
        panel.classList.add('active');
      }

      const nameEl = document.createElement('div');
      nameEl.className = 'player-name';
      nameEl.innerHTML = `<span class="dot" style="background:${Board.ownerColor(player.id)}"></span>${player.name}${player.isAI ? ' (AI)' : ''}`;
      panel.appendChild(nameEl);

      const moneyEl = document.createElement('div');
      moneyEl.className = 'player-money';
      moneyEl.textContent = `￥${player.money}`;
      panel.appendChild(moneyEl);

      const propsEl = document.createElement('div');
      propsEl.className = 'player-props';
      const props = player.properties.map(i => {
        const c = Board.cells[i];
        const h = player.getHouses(i);
        const tag = h >= 5 ? '🏨' : (h > 0 ? '🏠'.repeat(h) : '');
        return `${c.name}${tag}`;
      }).join('、');
      propsEl.textContent = props ? `地产：${props}` : '地产：无';
      panel.appendChild(propsEl);

      if (player.isBankrupt) {
        const statusEl = document.createElement('div');
        statusEl.className = 'bankrupt-tag';
        statusEl.textContent = '已破产';
        panel.appendChild(statusEl);
      }

      playersEl.appendChild(panel);
    });
  }

  // 更新按钮可用状态
  function updateButtons() {
    const player = Game.currentPlayer();
    const isHumanTurn = !player.isAI && !Game.gameOver;
    const cell = Board.cells[player.position];
    const canBuy = isHumanTurn && cell.type === 'property' && !cell.owner && player.money >= cell.price;
    const canBuild = isHumanTurn && Game.canBuildHouse(player, player.position);

    rollBtn.disabled = !isHumanTurn;
    buyBtn.disabled = !canBuy;
    buyBtn.style.display = canBuy ? 'inline-block' : 'none';
    buildBtn.disabled = !canBuild;
    buildBtn.style.display = canBuild ? 'inline-block' : 'none';
    buildBtn.textContent = canBuild ? `建房 (￥${cell.housePrice})` : '建房';
    endTurnBtn.disabled = !isHumanTurn;
  }

  // 显示消息
  function showMessage(text) {
    messageEl.textContent = text;
    // 同时输出到控制台便于调试
    console.log('[游戏]', text);
  }

  // 启动游戏
  Game.init();
  messageEl.textContent = '游戏开始！点击"掷骰"开始你的回合。';
})();
