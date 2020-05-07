const store = require("./store");
const utils = require("./utils");

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

    return {
      src: this.toBase64(),
      width: w,
      height: h,
    };
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
    const cursorElem = this.svgDot([230, foundY.pixel], "cursor");

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
    this.snap.mousemove((e, x) =>
      this.cursorMove(x, { cursorElem, labelElem, offsetLeft })
    );
  }

  cursorMove(x, { cursorElem, labelElem, offsetLeft }) {
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
  }

  liveLine(horizontalFLag = false) {
    let elemLine, elemId;
    elemId = utils.genId();
    this.liveMove((state, point) => {
      if (state === "start") {
        elemLine = this.svgLine(point, point, elemId);
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
        elemLine.attr(newPoint);
      } else if (state === "end") {
        elemLine.click(() => this.liveLineClick.call(this, elemId));
      }
    });
  }

  liveLineClick(elemId) {
    const elemDrag = this.getIdSnap(elemId);
    
    const points = [
      [elemDrag.attr("x1"), elemDrag.attr("y1")],
      [elemDrag.attr("x2"), elemDrag.attr("y2")],
    ];
    const navId = [`${elemId}-nav1`, `${elemId}-nav2`];

    // if nav elements exist remove & exit
    if (this.getId(navId[0]) && this.getId(navId[1])) {
      this.getId(navId[0]).remove();
      this.getId(navId[1]).remove();
      return;
    }

    const elemNav = this.svgDot(points[0], "lnav", navId[0]);
    const elemNav1 = this.svgDot(points[1], "lnav", navId[1]);

    this.liveDot({ elemDrag, elemNav }, ["x1", "y1"], () => {
      elemNav.remove();
      elemNav1.remove();
    });
    this.liveDot({ elemDrag, elemNav: elemNav1 }, ["x2", "y2"], () => {
      elemNav.remove();
      elemNav1.remove();
    });
  }

  /**
   * liveDot
   *
   * @param {Object} {elemDrag, elemNav}
   *  - elemDrag element on which will be perform drag process
   *  - elemNav element which perform action
   * @param {Array} attr - attributes which need to be updated
   * @param {function} finishCb - fire after finish the process
   */
  liveDot({ elemDrag, elemNav }, attr, finishCb) {
    const { offsetLeft, offsetTop } = store.get("area");

    elemNav.drag(
      (dx, dy, posx, posy) => {
        if (dx % 5 && dy % 5) {
          return;
        }
        const point = [posx - offsetLeft, posy - offsetTop];
        elemDrag.attr({ [attr[0]]: point[0], [attr[1]]: point[1] });
        elemNav.attr({ cx: point[0], cy: point[1] });
      },
      () => {},
      () => {
        finishCb && finishCb();
      }
    );
  }

  // dragChart() {
  //   const stepX = utils.f(store.get("stepX") / 3, 0);
  //   const self = this;

  //   this.group.drag(
  //     function (dx, dy) {
  //       console.log("draggg :::", stepX);
  //       if (!(dx % stepX)) {
  //         console.log("draggg & draw missing xAxis labels ..."); // like tradingView
  //         this.attr({
  //           transform:
  //             this.data("origTransform") +
  //             (this.data("origTransform") ? "T" : "t") +
  //             [dx],
  //         });
  //       }
  //     },
  //     function () {
  //       this.data("origTransform", this.transform().local);
  //     },
  //     function () {
  //       const dragX = this.transform().local.substr(1);
  //       self.dragX = parseInt(dragX);
  //       console.log("end :::", self.dragX, this.transform().local);
  //     }
  //   );
  // }

  redraw() {
    const raw = store.get("raw");

    this.deleteAll();
    store.reset();

    this.setup();
    // this.svgRectGroup();
    this.data(raw);
    this.drawAll();
  }

  next(chartData) {
    this.deleteAll();
    store.reset();

    this.setup();
    this.data(chartData);
    this.drawAll();
  }
}

module.exports = Chart;
