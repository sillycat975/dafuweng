// 简单 AI 决策
window.AI = {
  // 决定是否购买当前格子的地产
  decideBuy(player, cell) {
    if (cell.type !== 'property' || cell.owner) return false;
    // 简单策略：资金超过地价的 2 倍则购买，保留应急资金
    return player.money >= cell.price * 2;
  },

  // 决定是否在自己的地产上建房
  decideBuild(player, cell) {
    if (cell.type !== 'property' || cell.owner !== player.id) return false;
    // 策略：拥有整套颜色组、资金超过房价 3 倍时建房，保留应急资金
    return player.money >= cell.housePrice * 3;
  }
};
