import { g, brb } from "./t";

import { eobj } from "./t2";

const fxl = (function() {
  let outt = {
    g,
    t1: eobj.t1,
    t2: eobj.t2
  };
  console.log(">>>:", g, brb);


  return outt;
})();

console.log("---->", fxl);
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  console.log("-- export 1");
  module.exports = fxl;
} else {
  console.log("-- export 2");
  window.fxl = fxl;
}

// window.bb = {};
// global.bb.pr = () => {
//   console.log("----->>>", g.gg);
// };
// let message = "Hello World";
// console.log(message, g);