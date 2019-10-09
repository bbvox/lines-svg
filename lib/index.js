import Chart from "./chart"; 
import Calc from "./calc";
import store from "./store";

import cfg, { SVG, PART } from "./config";

/**
 * Only public methods here
 *  - everething else should be splited into other files
 *  - store.js
 *  - plus.js
 *  -
 */
let Lines = (function() {
  /** Constructor  */
  let Lines = function(elemId) {
    if (!this.getId(elemId)) {
      throw new Error("Missing SVG DOM Element !");
    } else if (!window.Snap) {
      throw new Error("Missing Snap.svg library !");
    }

    this.el = this.getId(elemId);
    this.snap = window.Snap("#" + elemId);

    this.chart = new Chart(elemId);
  };

  /**
   * public Method
   *  - store data into store ...
   * @param {Array} chartData
   *
   */
  Lines.prototype.data = function(chartData) {
    if (!(chartData instanceof Array)) {
      return;
    }

    store.save(chartData);

    this.calc = new Calc();

    
  };

  /*
                        _                            _   _               _     
     _ __ ___ _ __   __| | ___ _ __   _ __ ___   ___| |_| |__   ___   __| |___ 
    | '__/ _ \ '_ \ / _` |/ _ \ '__| | '_ ` _ \ / _ \ __| '_ \ / _ \ / _` / __|
    | | |  __/ | | | (_| |  __/ |    | | | | | |  __/ |_| | | | (_) | (_| \__ \
    |_|  \___|_| |_|\__,_|\___|_|    |_| |_| |_|\___|\__|_| |_|\___/ \__,_|___/
  */
  Lines.prototype.draw = function(drawType) {
    switch (drawType) {
      case PART.axis:
        this.chart.drawAxis();
        break;
    }
  };

  Lines.prototype.getId = function(elemID, snap = false) {
    var elem;
    elem = snap
      ? this.snap.select("#" + elemID)
      : document.getElementById(elemID);
    return elem || 0;
  };

  return Lines;
})();

// Export lines ...
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = Lines;
} else {
  window.Lines = Lines;
}
