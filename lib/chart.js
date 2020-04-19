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

  liveLine() {
    console.log("live LINE ...");
    // this.svgLine([50,50], [200,200]);
    let lineElem;
    this.liveMove((state, point) => {
      if (state === "start") {
        lineElem = this.svgLine(point, point);
      } else if (state === "move") {
        lineElem.attr({
          x2: point[0],
          y2: point[1],
        });
      }

      console.log("cb DATA ...", state, point);
    });
  }

  liveMove(cb) {
    let click = 0;
    const { offsetLeft, offsetTop } = store.get("area");
    this.snap.unclick();
    this.snap.click((e, x, y) => {
      const point = [x - offsetLeft, y - offsetTop];
      !click && cb("start", point);
      click++;
      if (click === 1) {
        this.snap.unmousemove();
        this.snap.mousemove(function (e, dx, dy) {
          if (!(dx % 5)) {
            const point2 = [dx - offsetLeft, dy - offsetTop];
            console.log(" move ... ");
            cb("move", point2);
          }
        });
      } else if (click === 2) {
        this.snap.unclick();
        this.snap.unmousemove();
        cb("finish");
      }
    });
  }
}

module.exports = Chart;
