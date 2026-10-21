// 游戏全局配置
window.GameConfig = {
  // 初始资金
  INITIAL_MONEY: 1500,
  // 经过起点奖励
  START_REWARD: 200,
  // 棋盘格子总数
  BOARD_SIZE: 20,
  // 房屋最高等级：4 栋房屋 + 1 栋旅馆 = 5
  MAX_HOUSES: 5,

  // 颜色组定义（同组全部拥有才能建房）
  COLOR_GROUPS: {
    brown:     [1, 2],
    lightblue: [4, 5],
    pink:      [7, 8],
    orange:    [10, 11],
    red:       [13, 14],
    yellow:    [16, 17],
    green:     [19]
  },

  // 棋盘格子配置：index 从 0 开始，0 为起点
  // type: 'start' | 'property' | 'empty'
  // 地产字段：color（颜色组）、housePrice（每栋房价）、rents（租金档位：[0房,1房,2房,3房,4房,旅馆]）
  BOARD: [
    { index: 0,  type: 'start',    name: '起点' },
    { index: 1,  type: 'property', name: '中山路', price: 120, color: 'brown',     housePrice: 50,  rents: [50,  100, 200, 400,  600, 800]  },
    { index: 2,  type: 'property', name: '南京路', price: 150, color: 'brown',     housePrice: 50,  rents: [60,  120, 240, 480,  700, 900]  },
    { index: 3,  type: 'empty',    name: '休息区' },
    { index: 4,  type: 'property', name: '北京路', price: 180, color: 'lightblue', housePrice: 75,  rents: [70,  140, 280, 560,  800, 1000] },
    { index: 5,  type: 'property', name: '解放路', price: 200, color: 'lightblue', housePrice: 75,  rents: [80,  160, 320, 640,  900, 1100] },
    { index: 6,  type: 'empty',    name: '公园' },
    { index: 7,  type: 'property', name: '人民路', price: 220, color: 'pink',      housePrice: 100, rents: [90,  180, 360, 720,  1000,1200] },
    { index: 8,  type: 'property', name: '建设路', price: 250, color: 'pink',      housePrice: 100, rents: [100, 200, 400, 800,  1100,1300] },
    { index: 9,  type: 'empty',    name: '广场' },
    { index: 10, type: 'property', name: '和平路', price: 280, color: 'orange',    housePrice: 125, rents: [110, 220, 440, 880,  1200,1400] },
    { index: 11, type: 'property', name: '光明路', price: 300, color: 'orange',    housePrice: 125, rents: [120, 240, 480, 960,  1300,1500] },
    { index: 12, type: 'empty',    name: '体育馆' },
    { index: 13, type: 'property', name: '幸福路', price: 320, color: 'red',       housePrice: 150, rents: [130, 260, 520, 1040, 1400,1600] },
    { index: 14, type: 'property', name: '富强路', price: 350, color: 'red',       housePrice: 150, rents: [140, 280, 560, 1120, 1500,1700] },
    { index: 15, type: 'empty',    name: '图书馆' },
    { index: 16, type: 'property', name: '民主路', price: 380, color: 'yellow',    housePrice: 175, rents: [150, 300, 600, 1200, 1600,1800] },
    { index: 17, type: 'property', name: '文明路', price: 400, color: 'yellow',    housePrice: 175, rents: [160, 320, 640, 1280, 1700,1900] },
    { index: 18, type: 'empty',    name: '博物馆' },
    { index: 19, type: 'property', name: '和谐路', price: 450, color: 'green',     housePrice: 200, rents: [180, 360, 720, 1440, 1900,2100] }
  ],

  // 颜色组对应的显示颜色
  COLOR_HEX: {
    brown:     '#8B4513',
    lightblue: '#87CEEB',
    pink:      '#FF69B4',
    orange:    '#FF8C00',
    red:       '#E74C3C',
    yellow:    '#F1C40F',
    green:     '#27AE60'
  }
};
