const store = require("./store");

const ChartPlus = require("./chart-plus");

class Chart extends ChartPlus {
  drawSma() {
    const points = store.get("points", "sma");

    this.svgPath(this.getPathFromPoints(points), "stsma");
  }

  drawEma() {
    const points = store.get("points", "ema");

    this.svgPath(this.getPathFromPoints(points), "stema");
  }
}

module.exports = Chart;
