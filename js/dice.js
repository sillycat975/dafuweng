// 骰子逻辑
window.Dice = {
  // 掷两个骰子，返回 { d1, d2, total }
  roll() {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    return { d1, d2, total: d1 + d2 };
  }
};
