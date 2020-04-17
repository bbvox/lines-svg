const store = require("./store");
const utils = require("./utils");

const ChartBase = require("./chart-base");

class ChartPlus extends ChartBase {
  drawCandle() {
    const candle = this.getCandle();
    candle.body.forEach((candle) => {
      const candleClass = candle.isWin ? "wcandle" : "lcandle";
      delete candle.isWin;
      this.svgRect(candle, candleClass);
    });

    candle.shadow.forEach((shadow) => {
      let shadowPath = this.getPathFromPoints(shadow.top);
      shadowPath += this.getPathFromPoints(shadow.bottom);

      this.svgPath(shadowPath, shadow.isWin ? "wcandle" : "lcandle");
    });
  }

  getCandle() {
    const candlePoints = store.get("points", "candle");
    const candle = {
      body: [],
      shadow: [],
    };

    candlePoints.forEach((cpoint) => {
      candle.body.push(utils.candle(cpoint));
      candle.shadow.push(utils.candle(cpoint, "shadow"));
    });
    return candle;
  }
}

module.exports = ChartPlus;