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
    let elemLine;
    const elemId = utils.genId();
    this.liveMove((state, point) => {
      if (state === "start") {
        elemLine = this.svgLine(point, point, elemId);
      } else if (state === "move") {
        elemLine.attr({
          x2: point[0],
          y2: point[1],
        });
      } else if (state === "end") {
        elemLine.click(() => this.liveLineClick.call(this, elemId));
      }
    });
  }

  liveLineClick(elemId) {
    if (this.liveDotDelete(elemId)) {
      return;
    }
    // if (this.liveDotExist(elemId)) {

    //   return;
    // }

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

    const elemNav = this.svgDot(points[0], "lnav", `${elemId}-nav1`);
    const elemNav1 = this.svgDot(points[1], "lnav", `${elemId}-nav2`);

    this.liveDot(
      elemNav,
      (point) => {
        elemDrag.attr({ x1: point[0], y1: point[1] });
      },
      () => {
        elemNav.remove();
        elemNav1.remove();
      }
    );

    this.liveDot(
      elemNav1,
      (point) => {
        elemDrag.attr({ x2: point[0], y2: point[1] });
      },
      () => {
        elemNav.remove();
        elemNav1.remove();
      }
    );
  }

  liveRect() {
    let elemRect, elemId;
    elemId = utils.genId("rect");
    let rectData = {};
    this.liveMove((state, point) => {
      if (state === "start") {
        rectData = this.calc.liveRect(point);
        elemRect = this.svgRect(rectData, false, elemId);
      } else if (state === "move") {
        elemRect.attr(this.calc.liveRect(point, rectData));
      } else if (state === "end") {
        elemRect.click(() => this.liveRectClick.call(this, elemId));
      }
    });
  }

  liveRectClick(elemId) {
    if (this.liveDotDelete(elemId)) {
      return;
    }

    const { x, y, width, height } = this.getIdAttr(elemId, [
      "x",
      "y",
      "width",
      "height",
    ]);

    const dots = {
      points: [
        [x, y],
        [x + width, y + height],
      ],
    };
    dots.elem = this.svgDot(dots.points[0], "lnav", `${elemId}-nav1`);
    dots.elem1 = this.svgDot(dots.points[1], "lnav", `${elemId}-nav2`);

    const finishCb = () => {
      this.delete([dots.elem, dots.elem1]);
    };

    this.liveDot(
      dots.elem,
      (point) => {
        console.log("drag DOT 1");
      },
      finishCb
    );

    this.liveDot(
      dots.elem1,
      (point) => {
        console.log("drag DOT 2");
      },
      finishCb
    );
  }

  liveCircle() {
    console.log("live CIRCLE");
  }

  liveText() {
    console.log("live Text on chart ...");
  }

  pointer(arrowFlag) {
    console.log("pointer ...");
  }

  redraw() {
    const raw = store.get("raw");

    this.deleteAll();
    store.reset();

    this.setup();
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
