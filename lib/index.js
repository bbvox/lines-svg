const Chart = require("./chart");

const { CHART, DRAW, config: cfg } = require("./config");

/**
 * Only public methods here
 *  - index.js - EXTERNAL INTERFACE
 *  - store.js - Internal STORE
 *  - calc-base.js - base calculation functions
 *  - calc.js - main calculation
 *  - chart-base.js - SVG graphic layer - wrapper to snapSvg
 *  - chart-plus.js - SVG candlestick/sma/ema layer
 *  - chart.js - SVG live Drawer / Pointer / Cursor layer
 *  - config.js - configuration
 *  - utils.js - Utility functions
 */
let Lines = (function () {
  let Lines = function (elemId) {
    if (!window.Snap) {
      throw new Error("Missing Snap.svg library !");
    }

    // chart-base > chart-plus > chart
    this.chart = new Chart(elemId);
  };

  /**
   * public Method
   *  - save data into store ...
   * @param {Array} chartData
   */
  Lines.prototype.data = function (chartData) {
    this.chart.data(chartData);
  };

  /*
                        _                            _   _               _     
     _ __ ___ _ __   __| | ___ _ __   _ __ ___   ___| |_| |__   ___   __| |___ 
    | '__/ _ \ '_ \ / _` |/ _ \ '__| | '_ ` _ \ / _ \ __| '_ \ / _ \ / _` / __|
    | | |  __/ | | | (_| |  __/ |    | | | | | |  __/ |_| | | | (_) | (_| \__ \
    |_|  \___|_| |_|\__,_|\___|_|    |_| |_| |_|\___|\__|_| |_|\___/ \__,_|___/
  */
  Lines.prototype.draw = function (chartType) {
    switch (chartType) {
      case CHART.axis:
        this.chart.drawAxis();
        break;
      case CHART.line:
        this.chart.drawLine();
        break;
      case CHART.candle:
        this.chart.drawCandle();
        break;
      case CHART.sma:
        this.chart.drawSma();
        break;
      case CHART.ema:
        this.chart.drawEma();
        break;
      default:
        this.chart.drawAxis();
        this.chart.drawCandle();
        this.chart.drawLine();
        this.chart.drawSma();
        this.chart.drawEma();
    }
  };

  Lines.prototype.getImage = function () {
    return this.chart.getImage();
  };

  // show/hide chart: line, candle, sma, ema
  Lines.prototype.toggle = function (chartType) {
    if (cfg.chart.type.includes(chartType)) {
      this.chart.toggle(chartType);
    }
  };

  // live Dot - ldot
  // follow the main linear chart on mouse move
  Lines.prototype.cursor = function () {
    this.chart.cursor();
  };

  // methods for drawing
  Lines.prototype.live = function (drawType = "line") {
    switch (drawType) {
      case DRAW.line:
        this.chart.liveLine();
        break;
      case DRAW.rect:
        this.chart.liveRect();
        break;
      case DRAW.text:
        this.chart.liveText();
        break;
      case DRAW.circle:
        this.chart.liveCircle();
        break;
      case DRAW.pointer:
        this.chart.livePointer();
        break;
    }
  };

  Lines.prototype.redraw = function () {
    this.chart.redraw();
  };

  // next or prev it is the same
  // delete all current data & draw new one based on chartData
  Lines.prototype.next = function (chartData) {
    this.chart.next(chartData);
  };

  return Lines;
})();

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = Lines;
} else {
  window.Lines = Lines;
}
