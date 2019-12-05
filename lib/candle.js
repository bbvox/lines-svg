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
    const candle = this.getCandle();
    candle.body.forEach(candle => {
      const candleClass = candle.isWin ? "wcandle" : "lcandle";
      delete candle.isWin;
      this.svgRect(candle, candleClass);
    });

    candle.shadow.forEach(shadow => {
      let shadowPath = this.getPath(shadow.top[0], shadow.top[1]);
      shadowPath += this.getPath(shadow.bottom[0], shadow.bottom[1]);
      this.svgPath(shadowPath, shadow.isWin ? "wcandle" : "lcandle");
    });
  }

  getCandle() {
    const candlePoints = store.get("points", "candle");
    const candle = {
      body: [],
      shadow: []
    }

    candlePoints.forEach(cpoint => {
      candle.body.push(utils.candle(cpoint));
      candle.shadow.push(utils.candle(cpoint, "shadow"));
    });
    return candle;
  }

}

module.exports = Candle;