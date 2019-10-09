// import * as store from "./store";
import chart from "./chart";
import store from "./store";
import Mth, { math1 } from "./math";
import Chart from "./chart";

console.log("---->", chart, store, math1, Mth);

let m = new Mth(123);

let c = new Chart("elem_id");
console.log(">>>>>>>>>>>>", c.get("elemId"));


console.log("--- m prop :", m);

m.calc();

/**
 * Only public methods here
 *  - everething else should be splited into other files
 *  - store.js
 *  - plus.js
 *  -
 */
let Lines = (function () {
  let Lines;

  /** Constructor  */
  Lines = function (elemId) {
    console.log("store : ", store);
    if (!this.getId(elemId)) {
      throw new Error("Missing SVG DOM Element !");
    } else if (!window.Snap) {
      throw new Error("Missing Snap.svg library !");
    }

    this.el = this.getId(elemId);
    this.snap = window.Snap("#" + elemId);

    chart.setup(elemId);
    // this.setupChart();
  };

  Lines.prototype.getId = function (elemID, snap = false) {
    var elem;
    elem = snap ? this.snap.select("#" + elemID) : document.getElementById(elemID);
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
