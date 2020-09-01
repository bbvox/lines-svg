const store = require("./store");
const utils = require("./utils");

const ChartBase = require("./chart-base");
const { config: cfg } = require("./config");

class ChartPlus extends ChartBase {
  drawCandle() {
    const candle = this.getCandle();
    candle.body.forEach((candle) => {
      const candleClass = candle.isWin ? "candleWin" : "candleLose";
      delete candle.isWin;
      this.svgRect(candle, candleClass);
    });

    candle.shadow.forEach((shadow) => {
      let shadowPath = this.getPathFromPoints(shadow.top);
      shadowPath += this.getPathFromPoints(shadow.bottom);

      this.svgPath(shadowPath, shadow.isWin ? "candleWin" : "candleLose");
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

  drawSma() {
    const points = store.get("points", "sma");
    this.svgPath(this.getPathFromPoints(points), "sma");
  }

  drawEma() {
    const points = store.get("points", "ema");
    this.svgPath(this.getPathFromPoints(points), "ema");
  }

  getImage() {
    const { w, h } = store.get("area");

    return {
      src: this.toBase64(),
      width: w,
      height: h,
    };
  }

  // {period: 15m}
  set(setupData) {
    const { timeUnits } = cfg;
    if (setupData && setupData.period && timeUnits.includes(setupData.period)) {
      store.set("config", { period: setupData.period });
    }
  }

  toggle(chartType) {
    let chartElem2 = false;
    if (chartType === "candle") {
      chartType = "candleWin";
      chartElem2 = this.getId("candleLose");
    }

    const chartElem = this.getId(chartType);
    if (!chartElem.style.display || chartElem.style.display === "block") {
      chartElem.style.display = "none";
      chartElem2 && (chartElem2.style.display = "none");
    } else {
      chartElem.style.display = "block";
      chartElem2 && (chartElem2.style.display = "block");
    }
  }
}

module.exports = ChartPlus;
