/**
 *  EXPORT : 
 *  config, { TYPES, PARTS }
 */
const config = {
  animate: false,
  zoomMove: true,
  chart: {
    type: ["line", "candle", "sma", "ema"],
    padding: 30,
    attr: { stroke: "#ddd", fill: "none", strokeWidth: 1 },
    textAttr: {
      "stroke-width": "0.1px",
      "font-family": "Verdana",
      "font-size": "12px",
      fill: "#000"
    },
    textBold: { "font-weight": "bold" },
    enableGrid: true,
    candleFill: 0.4,
    grids: 5,
    navDot: 6 // radius
  },
  cssClass: {
    textLabel: "tlabel",
    liveLabel: "llabel",
    liveLine: "lline",
    liveDot: "ldot",
    winCandle: "wcandle",
    loseCandle: "lcandle",
    debugDot: "ddot",
    line: "stline",
    sma: "stsma",
    ema: "stema",
    axis: "staxis",
    navDot: "stnavdot",
    moveNavDot: "movedot",
    rotateNavDot: "rotatedot"
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
    xLegend: 100
  },
  debug: {
    radius: 6,
    attr: { stroke: "red" }
  },
  timeUnit: "15m",
  timeUnits: ["15m", "30m", "1h", "4h", "1d", "1w"], //supported TIME UNITS
  drawOrder: ["drawLine", "drawCandle", "drawSMA", "drawEMA"]
};

// chart SVG 
export const SVG = {
  line: "line",
  text: "text",
  rect: "rect",
  circle: "circle",
  path: "path",
  input: "input"
};

// chart Parts
export const PART = {
  axis: "axis",
  legend: "legend",
  debug: "debug",
  sinit: "sinit",
  init: "init",
  line: "line",
  candle: "candle",
  sma: "sma",
  ema: "ema"
};

export default config;
