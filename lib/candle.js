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
    const candleShadow = store.get("candleShadow");
    candlePoints.forEach(candle => {
      const candleClass = candle.isWin ? "wcandle" : "lcandle"
      this.svgRect(candle, candleClass);
    });

    // let shadowPath;
    candleShadow.forEach(shadow => {
      let shadowPath = this.getPath(shadow.top[0], shadow.top[1]);
      shadowPath += this.getPath(shadow.bottom[0], shadow.bottom[1]);

      this.svgPath(shadowPath, shadow.isWin ? "wcandle" : "lcandle");
    });

  }
}

module.exports = Candle;