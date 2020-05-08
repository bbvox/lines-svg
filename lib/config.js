/**
 *  EXPORT :
 *  config, { TYPES, PARTS }
 */
const config = {
  debug: false,
  chart: {
    type: ["line", "candle", "sma", "ema"],
    paddingX: 30,
    paddingY: 30,
    enableGrid: true,
    candleFill: 0.4,
    totalGrids: 5,
    labelXskipLength: 21,
  },
  svg: {
    line: {
      stroke: "#505050",
      strokeWidth: 3,
      class: "liveLine",
      cursor: "pointer",
    },
    path: {
      stroke: "#36a2eb",
    },
    rectGroup: {
      candleWin: {
        stroke: `#f00`,
        fill: `#f00`,
        id: "candleWin",
      },
      candleLose: {
        stroke: `#00f`,
        fill: `#00f`,
        id: "candleLose",
      },
    },
    rect: {
      lnav: {
        cursor: "pointer",
        fill: "#828282",
      },
    },
    circle: {
      cursor: {
        fill: "#388E3C",
        strokeWidth: 9,
        stroke: "#00bcd480",
        id: "liveCursor",
      },
      lnav: {
        class: "lnav",
        r: 6,
      },
      lcir: {
        cursor: "pointer",
        fill: "#828282",
      }
    },
  },
  colors: {
    candleWin: "f00",
    candleLose: "00f",
    grid: "ddd",
    line: "36a2eb",
    sma: "ff9f40",
    ema: "9966ff",
    cursor: { fill: "388E3C", stroke: "00bcd480" },
    lline: "505050",
  },
  smaLength: 5,
  emaLength: 10,
  magnetMode: 50,
  step: {
    x: 50,
    xMin: 20,
    xMax: 100,
    yMax: 20,
    arrow: 50,
    zoom: 9,
    offset: 9,
    xLegend: 100,
  },
  timeUnit: "15m",
  timeUnits: ["15m", "30m", "1h", "4h", "1d", "1w"], //supported TIME UNITS
  drawOrder: ["drawLine", "drawCandle", "drawSMA", "drawEMA"],
};

// chart SVG
const SVG = {
  line: "line",
  text: "text",
  rect: "rect",
  circle: "circle",
  path: "path",
  input: "input",
};

// // chart Parts
const PART = {
  axis: "axis",
  line: "line",
  candle: "candle",
  legend: "legend",
  debug: "debug",
  sinit: "sinit",
  init: "init",
  sma: "sma",
  ema: "ema",
};

module.exports = {
  config,
  SVG,
  PART,
};
