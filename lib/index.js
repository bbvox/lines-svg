const store = require("./store");
const Calc = require("./calc");
const Chart = require("./chart");

const { PART, config: cfg } = require("./config");

window.cl = console.log;
/**
 * Only public methods here
 *  - everething else should be splited into other files
 *  - store.js - GLOBAL STORE
 *  - calc.js - calculation
 *  - chart.js - SVG line layer
 *  - candle.js - SVG candle layer
 *  - config.js - configuration
 */
let Lines = (function () {
  let Lines = function (elemId) {
    if (!window.Snap) {
      throw new Error("Missing Snap.svg library !");
    }

    this.calc = new Calc();
    // chart-base > chart-plus > chart
    // pass instance of calc to chart ...
    this.chart = new Chart(elemId, this.calc);
  };

  /**
   * public Method
   *  - save data into store ...
   * @param {Array} chartData
   */
  Lines.prototype.data = function (chartData) {
    if (!(chartData instanceof Array)) {
      throw new Error("Missing library  data !");
    }

    store.save(chartData);

    this.calc.start();
    // lines ... candles ...
    this.calc.main();
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
      case PART.axis:
        this.chart.drawAxis();
        break;
      case PART.line:
        this.chart.drawLine();
        break;
      case PART.candle:
        this.chart.drawCandle();
        break;
      case PART.sma:
        this.chart.drawSma();
        break;
      case PART.ema:
        this.chart.drawEma();
        break;
      default:
        this.chart.drawAxis();
        this.chart.drawLine();
        this.chart.drawCandle();
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
  Lines.prototype.cursor = function () {
    console.log("... start cursor ...");
  };
  
  // allow to draw Line ...
  Lines.prototype.drawer = function () {
    console.log("... start drawer ...");

  };

  return Lines;
})();

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = Lines;
} else {
  window.Lines = Lines;
}
