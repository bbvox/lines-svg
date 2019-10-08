// import * as store from "./store";
import store from "./store";
import mth, { math1 } from "./math";

console.log("---->", store, math1, mth);

/**
 * Only public methods here
 *  - everething else should be splited into other files
 *  - store.js
 *  - plus.js
 *  -
 */
let Lines = (function() {
  let Lines;

  /** Constructor  */
  Lines = function() {
    console.log("store : ", store);
  };

  return Lines;
})();

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = Lines;
} else {
  window.Lines = Lines;
}
