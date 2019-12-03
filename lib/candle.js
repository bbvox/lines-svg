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
    let candleBody = [], candleShadow = [];
    const candlePoints = store.get("points", "candle");

    candlePoints.forEach(cpoint => {
      candleBody.push(utils.candle(cpoint));
      candleShadow.push(utils.candle(cpoint, "shadow"));
    });
    //draw candleBody
    candleBody.forEach(candle => {
      const candleClass = candle.isWin ? "wcandle" : "lcandle";
      delete candle.isWin;
      this.svgRect(candle, candleClass);
    });

    //draw candleBody
    candleShadow.forEach(shadow => {
      let shadowPath = this.getPath(shadow.top[0], shadow.top[1]);
      shadowPath += this.getPath(shadow.bottom[0], shadow.bottom[1]);

      this.svgPath(shadowPath, shadow.isWin ? "wcandle" : "lcandle");
    });
  }
}

module.exports = Candle;