const store = require("./store");
const utils = require("./utils");

const ChartPlus = require("./chart-plus");

// liveLine - liveLineClick
// liveRect - liveRectClick
// liveCircle - liveCircleClick
// livePointer - livePointerClick
// liveText - liveTextClick
class Chart extends ChartPlus {
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
        elemLine.dblclick(() => elemLine.remove());
      }
    });
  }

  liveLineClick(elemId) {
    if (this.liveDotDelete(elemId)) {
      return;
    }

    const { x1, x2, y1, y2 } = this.getIdAttr(elemId, ["x1", "x2", "y1", "y2"]);

    const dots = {
      points: [
        [x1, y1],
        [x2, y2],
      ],
    };
    dots.elem = this.svgDot(dots.points[0], "lnav", `${elemId}-nav1`);
    dots.elem1 = this.svgDot(dots.points[1], "lnav", `${elemId}-nav2`);

    const finishCb = () => {
      this.delete([dots.elem, dots.elem1]);
    };

    const elemDrag = this.getIdSnap(elemId);

    this.liveDot(
      dots.elem,
      (point) => {
        elemDrag.attr({ x1: point[0], y1: point[1] });
      },
      finishCb
    );

    this.liveDot(
      dots.elem1,
      (point) => {
        elemDrag.attr({ x2: point[0], y2: point[1] });
      },
      finishCb
    );
  }

  liveRect() {
    let elemRect, elemId;
    elemId = utils.genId("rect");
    let rectData = {};
    this.liveMove((state, point) => {
      if (state === "start") {
        rectData = this.calc.liveRect(point);
        elemRect = this.svgRect(rectData, "lnav", elemId);
      } else if (state === "move") {
        elemRect.attr(this.calc.liveRect(point, rectData));
      } else if (state === "end") {
        elemRect.click(() => this.liveRectClick.call(this, elemId));
        elemRect.dblclick(() => elemRect.remove());
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

    const elemDrag = this.getIdSnap(elemId);

    this.liveDot(
      dots.elem,
      (point) => {
        elemDrag.attr({ x: point[0], y: point[1] });
        // update second dot
        dots.elem1.attr({ cx: point[0] + width, cy: point[1] + height });
      },
      finishCb
    );

    this.liveDot(
      dots.elem1,
      (point) => {
        elemDrag.attr(this.calc.liveRect(point, { x, y, width, height }));
      },
      finishCb
    );
  }

  liveCircle() {
    let elemCircle;
    const elemId = utils.genId("circle");
    let dataCircle;
    this.liveMove((state, point) => {
      if (state === "start") {
        dataCircle = point;
        elemCircle = this.svgDot(dataCircle, "lcir", elemId);
      } else if (state === "move") {
        elemCircle.attr(this.calc.liveCircle(point, dataCircle));
      } else if (state === "end") {
        elemCircle.click(() => this.liveCircleClick.call(this, elemId));
        elemCircle.dblclick(() => elemCircle.remove());
      }
    });
  }

  liveCircleClick(elemId) {
    if (this.liveDotDelete(elemId)) {
      return;
    }
    const { cx, cy, r } = this.getIdAttr(elemId, ["cx", "cy", "r"]);

    const dots = {
      points: [
        [cx, cy],
        [cx + r, cy],
      ],
    };
    dots.elem = this.svgDot(dots.points[0], "lnav", `${elemId}-nav1`);
    dots.elem1 = this.svgDot(dots.points[1], "lnav", `${elemId}-nav2`);
    const finishCb = () => {
      this.delete([dots.elem, dots.elem1]);
    };

    const elemDrag = this.getIdSnap(elemId);
    this.liveDot(
      dots.elem,
      (point) => {
        elemDrag.attr({ cx: point[0], cy: point[1] });
        dots.elem1.attr({ cx: point[0] + r, cy: point[1] });
      },
      finishCb
    );

    this.liveDot(
      dots.elem1,
      (point) => {
        elemDrag.attr(this.calc.liveCircle(point, [cx, cy]));
      },
      finishCb
    );
  }

  livePointer(arrowFlag) {
    let elemPointer, elemText;
    const elemId = utils.genId("pointer");
    const elemId1 = utils.genId("ptext");
    let dataPointer;
    this.liveMove((state, point) => {
      if (state === "start") {
        dataPointer = [point[0], this.calc.findY(point[0]).pixel];
        elemPointer = this.svgLine(dataPointer, dataPointer, elemId);

        elemText = this.svgText(
          {
            point: dataPointer,
            label: this.calc.findY(point[0]).value,
          },
          elemId1
        );
      } else if (state === "move") {
        const newPoint = this.calc.livePointer(point);
        elemText.attr({
          x: newPoint["x2"],
          y: newPoint["y2"],
        });
        elemText.node.innerHTML = newPoint.foundY.value;
        delete newPoint.foundY;
        elemPointer.attr(newPoint);
      } else if (state === "end") {
        elemPointer.click(() =>
          this.livePointerClick.call(this, elemId, elemId1)
        );
      }
    });
  }

  livePointerClick(elemId, elemId1) {
    if (this.liveDotDelete(elemId)) {
      return;
    }
    const { x2, y2 } = this.getIdAttr(elemId, ["x2", "y2"]);

    const dots = {
      points: [[x2, y2]],
    };
    dots.elem = this.svgDot(dots.points[0], "lnav", `${elemId}-nav1`);

    const elemDrag = this.getIdSnap(elemId);
    const elemText = this.getIdSnap(elemId1);

    this.liveDot(
      dots.elem,
      (point) => {
        const newPoint = this.calc.livePointer(point);
        elemText.attr({
          x: newPoint["x2"],
          y: newPoint["y2"],
        });
        elemText.node.innerHTML = newPoint.foundY.value;
        delete newPoint.foundY;
        elemDrag.attr(newPoint);
      },
      () => {
        this.delete([dots.elem]);
      }
    );
  }

  liveText() {
    let elemText;
    const elemId = utils.genId("text");
    this.liveMove((state, point) => {
      if (state === "start") {
        this.textSvg(point, elemId);
        elemText = this.getIdSnap(elemId);
      } else if (state === "move") {
        elemText.attr({
          x: point[0],
          y: point[1],
        });
      } else if (state === "end") {
        elemText.click(() => this.liveTextClick.call(this, elemId));
        elemText.dblclick(() => elemText.remove());
      }
    });
  }

  liveTextClick(elemId) {
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
    dots.finishCb = () => {
      this.delete([dots.elem, dots.elem1]);
    };

    const elemDrag = this.getIdSnap(elemId);

    this.liveDot(
      dots.elem,
      (point) => {
        elemDrag.attr({ x: point[0], y: point[1] });
        dots.elem1.attr({ cx: point[0] + width, cy: point[1] + height });
      },
      dots.finishCb
    );
    this.liveDot(
      dots.elem1,
      (point) => {
        console.log("width : ", width, height);
        const newData = {
          width: point[0] - x,
          height: point[1] - y,
        };
        elemDrag.attr(newData);
      },
      dots.finishCb
    );
  }

  liveChannel(disjoint = false) {
    let elemLine, elemLine2;
    const elemId = utils.genId();
    let axis = [];

    this.liveMove((state, point) => {
      if (state === "start") {
        elemLine = this.svgLine(point, point, elemId);
        axis[0] = [point[0], point[1] + 30];
        elemLine2 = this.svgLine(axis[0], axis[0], elemId + "-2");
      } else if (state === "move") {
        elemLine.attr({
          x2: point[0],
          y2: point[1],
        });
        axis[1] = [point[0], point[1] + 30];
        elemLine2.attr({
          x2: axis[1][0],
          y2: axis[1][1],
        });
      } else if (state === "double") {
        const diffY = axis[0][1] - axis[1][1];
        if (point[1] > axis[1][1]) {
          elemLine2.attr({
            y1: point[1] + diffY,
            y2: point[1],
          });
        }
      } else if (state === "end") {
        elemLine.click(() => this.liveChannelClick.call(this, elemId));
        elemLine2.click(() => this.liveChannelClick.call(this, elemId + "-2"));
        elemLine.dblclick(() => {
          elemLine.remove();
          elemLine2.remove();
        });
        elemLine2.dblclick(() => {
          elemLine.remove();
          elemLine2.remove();
        });
      }
    }, true);
  }

  // too many elements on interaction ...
  liveChannelClick(elemId) {
    const elemId2 = this.getElemId2(elemId);
    const isElem2 = elemId.includes("-2");

    // delete dots if exist
    if (this.liveDotDelete(elemId)) {
      return;
    }

    const elemAttr1 = this.getIdAttr(elemId, ["x1", "x2", "y1", "y2"]);
    const elemAttr2 = this.getIdAttr(elemId2, ["x1", "x2", "y1", "y2"]);

    const dots = {
      points: [
        [elemAttr1.x1, elemAttr1.y1],
        [elemAttr2.x2, elemAttr2.y2],
      ],
      diff: {
        axis: [elemAttr1.x2 - elemAttr1.x1, elemAttr1.y2 - elemAttr1.y1],
        diffY: elemAttr1.y2 - elemAttr2.y2,
      },
    };

    // if click on second element
    if (isElem2) {
      dots.points = [
        [elemAttr2.x1, elemAttr2.y1],
        [elemAttr1.x2, elemAttr1.y2],
      ];
    }

    dots.elem1 = this.svgDot(dots.points[0], "lnav", `${elemId}-nav1`);
    dots.elem2 = this.svgDot(dots.points[1], "lnav", `${elemId}-nav2`);

    const finishCb = () => {
      this.delete([dots.elem1, dots.elem2]);
    };

    const elemDrag1 = this.getIdSnap(elemId);
    const elemDrag2 = this.getIdSnap(elemId2);

    this.liveDot(
      dots.elem1,
      (point) => {
        const elemAttr = {
          x1: point[0],
          y1: point[1],
          x2: point[0] + dots.diff.axis[0],
          y2: point[1] + dots.diff.axis[1],
        };
        elemDrag1.attr(elemAttr);

        elemDrag2.attr({
          ...elemAttr,
          y1: elemAttr.y1 + (isElem2 ? dots.diff.diffY : -dots.diff.diffY),
          y2: elemAttr.y2 + (isElem2 ? dots.diff.diffY : -dots.diff.diffY),
        });

        dots.elem2.attr({
          cx: elemAttr.x2,
          cy: elemAttr.y2 + (isElem2 ? dots.diff.diffY : -dots.diff.diffY),
        });
      },
      finishCb
    );

    this.liveDot(
      dots.elem2,
      (point) => {
        const diffY = elemAttr1.y1 - elemAttr1.y2;
        if (isElem2) {
          elemDrag1.attr({
            y1: point[1] + diffY,
            y2: point[1],
          });
        } else {
          elemDrag2.attr({
            y1: point[1] + diffY,
            y2: point[1],
          });
        }
      },
      finishCb,
      true
    );

    // this.liveDot(dots.elem3, cbFunc.moveCb, cbFunc.finishCb);
  }

  /**
   * getElemId2
   * get other element Id
   * @param {String} elemId
   *  - line-14 - first element
   *  - line-14-2 - second element
   * @returns {string} elementID2
   */
  getElemId2(elemId) {
    const [elId1, elId2, elId3] = elemId.split("-");

    return elId3 ? `${elId1}-${elId2}` : `${elId1}-${elId2}-2`;
  }

  reset() {
    this.deleteAll();
    store.reset();
  }

  redraw() {
    const raw = store.get("raw");

    this.reset();

    this.setup();
    this.data(raw);
    this.drawAll();
  }

  next(chartData) {
    this.reset();

    this.setup();
    this.data(chartData);
    this.drawAll();
  }
}

module.exports = Chart;
