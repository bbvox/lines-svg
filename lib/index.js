import Calc from "./calc";
import store from "./store";

import Chart from "./chart";

import Candle from "./candle";

import cfg, { SVG, PART } from "./config";

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
    // cbase > line > candle > sma > ema > chart 
    // chart > candle > sma > ema
    // pass instance of calc to chart ...
    this.chart = new Candle(elemId, this.calc);
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
    this.calc.main();
  };

  /*
                        _                            _   _               _     
     _ __ ___ _ __   __| | ___ _ __   _ __ ___   ___| |_| |__   ___   __| |___ 
    | '__/ _ \ '_ \ / _` |/ _ \ '__| | '_ ` _ \ / _ \ __| '_ \ / _ \ / _` / __|
    | | |  __/ | | | (_| |  __/ |    | | | | | |  __/ |_| | | | (_) | (_| \__ \
    |_|  \___|_| |_|\__,_|\___|_|    |_| |_| |_|\___|\__|_| |_|\___/ \__,_|___/
  */
  Lines.prototype.draw = function (drawType) {
    switch (drawType) {
      case PART.axis:
        this.chart.drawAxis();
        break;
      case PART.line:
        this.chart.drawLine();
        break;
      case PART.candle:
        this.chart.drawCandle();
        break;
    }
  };

  return Lines;
})();

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = Lines;
} else {
  window.Lines = Lines;
}
