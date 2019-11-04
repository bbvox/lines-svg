import Chart from "./chart";
import Calc from "./calc";
import store from "./store";

import cfg, { SVG, PART } from "./config";

window.cl = console.log;
/**
 * Only public methods here
 *  - everething else should be splited into other files
 *  - store.js - GLOBAL STORE
 *  - calc.js - calculation 
 *  - chart.js - SVG layer
 *  - config.js - configuration
 */
let Lines = (function () {
  let Lines = function (elemId) {
    if (!window.Snap) {
      throw new Error("Missing Snap.svg library !");
    }

    this.chart = new Chart(elemId);
  };

  /**
   * public Method
   *  - save data into store ...
   * @param {Array} chartData
   *
   */
  Lines.prototype.data = function (chartData) {
    if (!(chartData instanceof Array)) {
      throw new Error("Missing library  data !");
    }

    store.save(chartData);

    this.calc = new Calc();
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
    }
  };

  return Lines;
})();

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = Lines;
} else {
  window.Lines = Lines;
}