// 玩家模型
class Player {
  constructor(id, name, isAI = false) {
    this.id = id;
    this.name = name;
    this.isAI = isAI;
    this.money = GameConfig.INITIAL_MONEY;
    this.position = 0;            // 棋盘格子索引
    this.properties = [];         // 持有的地产格子索引
    this.houses = {};             // 每块地产的房屋数：{ cellIndex: 0~5 }（5=旅馆）
    this.isBankrupt = false;
  }

  // 赚钱
  earn(amount) {
    this.money += amount;
  }

  // 付钱；若资金不足则付全部并标记破产
  pay(amount) {
    if (this.money >= amount) {
      this.money -= amount;
      return amount;
    } else {
      const paid = this.money;
      this.money = 0;
      this.isBankrupt = true;
      return paid;
    }
  }

  // 移动 steps 步，返回是否经过起点
  move(steps) {
    const oldPos = this.position;
    const newPos = (this.position + steps) % GameConfig.BOARD_SIZE;
    this.position = newPos;
    // 经过起点（含直接停在起点之外的跨越）
    return (oldPos + steps) >= GameConfig.BOARD_SIZE;
  }

  // 购买地产
  buyProperty(cellIndex, price) {
    if (this.money >= price) {
      this.money -= price;
      this.properties.push(cellIndex);
      return true;
    }
    return false;
  }

  // 是否持有某地产
  owns(cellIndex) {
    return this.properties.includes(cellIndex);
  }

  // 获取某地产的房屋数
  getHouses(cellIndex) {
    return this.houses[cellIndex] || 0;
  }

  // 在某地产上建一栋房（需外部先校验资格与资金）
  buildHouse(cellIndex, price) {
    if (this.money < price) return false;
    const current = this.getHouses(cellIndex);
    if (current >= GameConfig.MAX_HOUSES) return false;
    this.money -= price;
    this.houses[cellIndex] = current + 1;
    return true;
  }

  // 失去某地产时清除其房屋数
  removeProperty(cellIndex) {
    const idx = this.properties.indexOf(cellIndex);
    if (idx >= 0) this.properties.splice(idx, 1);
    delete this.houses[cellIndex];
  }
}

window.Player = Player;
