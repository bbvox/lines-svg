const store = require("./store");

const ChartPlus = require("./chart-plus");

class Chart extends ChartPlus {
  drawSma() {
    const points = store.get("points", "sma");
    this.svgPath(this.getPathFromPoints(points), "sma");
  }

  drawEma() {
    const points = store.get("points", "ema");

    this.svgPath(this.getPathFromPoints(points), "ema");
  }

  /////// New features ...
  getImage() {
    const { w, h } = store.get("area");
    const imgElem = document.createElement("img");

    imgElem.setAttribute("src", this.toBase64());
    imgElem.setAttribute("width", w);
    imgElem.setAttribute("height", h);

    return imgElem;
  }

  // candle have two groups - candleWin & candleLose
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

  cursor() {
    const foundY = this.calc.findY(230);
    const cursorElem = this.svgCircle([230, foundY.pixel], "cursor");

    const {
      area: { offsetLeft },
      zeroX,
    } = store.mget(["area", "zeroX"]);
    const labelElem = this.svgText({
      point: [zeroX, foundY.pixel],
      label: foundY.value,
    });

    this.snap.unmousemove();
    this.snap.mousemove((e, x) => {
      x -= offsetLeft;
      if (!(x % 5)) {
        const findY = this.calc.findY(x);
        if (findY) {
          cursorElem.attr({
            cx: x,
            cy: findY.pixel,
          });
          labelElem.node.innerHTML = findY.value;
          labelElem.attr({
            y: findY.pixel,
          });
        }
      }
    });
  }
}

module.exports = Chart;
