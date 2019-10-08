(function () {
  'use strict';

  const g = 19;

  const brb = (v1) => {
    console.log(" call v1 function :::", v1);
  };

  const eobj = {};

  eobj.t1 = "gaga";
  eobj.t2 = "t2 var";

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

}());
