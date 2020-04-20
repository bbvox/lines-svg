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
    if (this.getId("liveCursor")) {
      this.getId("liveCursor").remove();
      this.getId("liveText").remove();
      return;
    }
    const foundY = this.calc.findY(230);
    const cursorElem = this.svgCircle([230, foundY.pixel], "cursor");

    const {
      area: { offsetLeft },
      zeroX,
    } = store.mget(["area", "zeroX"]);
    const labelElem = this.svgText(
      {
        point: [zeroX, foundY.pixel],
        label: foundY.value,
      },
      "liveText"
    );

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

  liveLine(horizontalFLag = false) {
    let lineElem;
    this.liveMove((state, point) => {
      if (state === "start") {
        lineElem = this.svgLine(point, point);
        this.svgCircle(point, "liveNav");
      } else if (state === "move") {
        let newPoint = {};
        if (horizontalFLag) {
          newPoint = {
            x2: point[0],
          };
        } else {
          newPoint = {
            x2: point[0],
            y2: point[1],
          };
        }
        lineElem.attr(newPoint);
      }
    });
  }

  dragChart() {
    // this.snap.drag()
    // this.group.drag((x, y) => {
    //   console.log("... drag : ", x, y, arguments);
    // });

    this.group.drag(function (dx, dy) {
      console.log("draggg ")
      if (!(dx % 20)) {
        console.log("draggg & draw missing xAxis labels ..."); // like tradingView
        this.attr({
          transform:
            this.data("origTransform") +
            (this.data("origTransform") ? "T" : "t") +
            [dx],
        });
      }
    }, function () {
      this.data('origTransform', this.transform().local );
    });
    //   dragX = moveX;

    //   self.lcGroup.attr({ transform: "t" + (dragX + self.dragX) });
    // }, () => {}, () => {
    //   self.dragX += dragX;
    // });
  }
}

module.exports = Chart;
