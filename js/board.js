// 棋盘渲染
window.Board = {
  cells: [],  // 运行时格子数据（含 owner）

  // 初始化格子数据
  init() {
    this.cells = GameConfig.BOARD.map(c => ({ ...c, owner: null }));
  },

  // 渲染棋盘 DOM（20 格排列在 6x6 网格外圈）
  render(container, players) {
    container.innerHTML = '';
    this.cells.forEach(cell => {
      const el = document.createElement('div');
      el.className = `cell cell-${cell.type}`;
      el.dataset.index = cell.index;

      // 计算在 6x6 网格中的位置
      const pos = this.gridPosition(cell.index);
      el.style.gridRow = pos.row;
      el.style.gridColumn = pos.col;

      // 颜色条（地产顶部）
      if (cell.type === 'property') {
        const colorBar = document.createElement('div');
        colorBar.className = 'cell-color-bar';
        colorBar.style.backgroundColor = GameConfig.COLOR_HEX[cell.color] || '#999';
        el.appendChild(colorBar);
      }

      const nameEl = document.createElement('div');
      nameEl.className = 'cell-name';
      nameEl.textContent = cell.name;
      el.appendChild(nameEl);

      if (cell.type === 'property') {
        const priceEl = document.createElement('div');
        priceEl.className = 'cell-price';
        priceEl.textContent = `￥${cell.price}`;
        el.appendChild(priceEl);

        // 房屋数标记
        const owner = cell.owner ? players.find(p => p.id === cell.owner) : null;
        const houseCount = owner ? owner.getHouses(cell.index) : 0;
        if (houseCount > 0) {
          const houseEl = document.createElement('div');
          houseEl.className = 'cell-houses';
          houseEl.textContent = houseCount >= 5 ? '🏨' : '🏠'.repeat(Math.min(houseCount, 4));
          houseEl.title = houseCount >= 5 ? '旅馆' : `${houseCount} 栋房屋`;
          el.appendChild(houseEl);
        }
      }

      // 地主标记
      if (cell.owner) {
        el.classList.add('owned');
        el.style.borderColor = this.ownerColor(cell.owner);
      }

      container.appendChild(el);
    });
    this.renderPlayers(container, players);
  },

  // 计算格子在 6x6 网格中的行列位置（外圈排列）
  // 上: 0-5, 右: 6-9, 下: 10-15, 左: 16-19
  gridPosition(index) {
    if (index <= 5) {
      return { row: 1, col: index + 1 };          // 上边（左→右）
    } else if (index <= 9) {
      return { row: index - 4, col: 6 };           // 右边（上→下）
    } else if (index <= 15) {
      return { row: 6, col: 16 - index };          // 下边（右→左）
    } else {
      return { row: 21 - index, col: 1 };          // 左边（下→上）
    }
  },

  // 获取玩家颜色
  ownerColor(ownerId) {
    const colors = { 'p1': '#3498db', 'p2': '#e74c3c' };
    return colors[ownerId] || '#999';
  },

  // 渲染玩家棋子
  renderPlayers(container, players) {
    // 清除旧棋子
    container.querySelectorAll('.token').forEach(t => t.remove());

    players.forEach(player => {
      if (player.isBankrupt) return;
      const cellEl = container.querySelector(`[data-index="${player.position}"]`);
      if (!cellEl) return;
      const token = document.createElement('div');
      token.className = 'token';
      token.style.backgroundColor = this.ownerColor(player.id);
      token.title = player.name;
      cellEl.appendChild(token);
    });
  }
};
