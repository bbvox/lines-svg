const store = require("./store");
const utils = require("./utils");

const cfg = require("./config");
const Chart = require("./chart");

class Candle extends Chart {
  //call parent constructor
  constructor(elemId, calcInstance) {
    super(elemId, calcInstance);
  }

  //default for inital setup of method
  init() {
    super.init();
    // this.calc.candleWidth();
  }

  drawCandle() {
    cl("draw Candle NOW ...:", store.all(), store.get("stepX"));


  }

}

module.exports = Candle;