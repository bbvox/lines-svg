const store = require("./store");
const utils = require("./utils");

const cfg = require("./config");
const Chart = require("./chart");

class Candle extends Chart {
  //call parent constructor
  constructor(elemId, calcInstance) {
    super(elemId, calcInstance);
  }

  drawCandle() {
    // should be calculated
    const candlePoints = store.get("candlePoints");
    cl("draw Candle NOW 3 ...:", candlePoints);
    candlePoints.forEach(candle => this.svgRect(candle));
  }

}

module.exports = Candle;