import store from "./store";

import cfg, { SVG, PART } from "./config";

class Chart {
  constructor(elemId) {
    if (!window.getComputedStyle) {
      return;
    }

    this.el = this.getId(elemId);
    this.snap = window.Snap("#" + elemId);

    this.init();
  }

  init() {
    const elemStyle = window.getComputedStyle(this.el);
    const width = parseInt(elemStyle.width);
    const height = parseInt(elemStyle.height);

    this.area = {
      w: width,
      h: height,
      width: (width - (cfg.chart.padding * 2)),
      height: (height - (cfg.chart.padding * 2)),
      endX: cfg.chart.padding,
      zeroX: cfg.chart.padding,
      zeroY: height - cfg.chart.padding,
      offsetLeft: this.el.offsetLeft || this.el.parentElement.offsetLeft || 0,
      offsetTop: this.el.offsetTop || this.el.parentElement.offsetTop || 0
    }
    store.set("area", this.area);
  }

  drawAxis() {
    this.drawLabels("X");
    this.drawLabels("Y");
  }

  drawLabels(axis) {
    if (axis === "X") {
      console.log("draw X axis");
      this.draw();
    } else if (axis === "Y") {
      console.log("draw Y axis");
    }
  }

  drawLine() {
    const { points, len } = store.mget(["points", "len"]);
    // index start from 0 & ignore last point
    const lastIndex = len - 1;
    let pk = 0;
    let path = "";
    for (; pk < lastIndex; pk++) {
      path += this.path(points[pk], points[pk + 1]);
    }

    cl(path);
    this.drawPath(path);
  }

  debug(point) {
    const circle = this.snap.circle({ cx: point[0], cy: point[1], r: 10 });
    // cl("..", point);
  }

  path(point1, point2) {
    let path = `M${Math.floor(point1[0])} ${Math.floor(point1[1])}`;
    path += `L${Math.floor(point2[0])} ${Math.floor(point2[1])}`;

    return path;
  }

  drawPath(path) {
    let pathElem = this.snap.path(path);
    pathElem.attr({ class: "stline" });
  }

  draw() {
    const lineProp = {
      path: "M30 400L799 400M30 326L799 326M30 252L799 252M30 178L799 178M30 104L799 104M30 30L799 30",
      type: "axis"
    }
    const svg = this.snap.path(lineProp.path);
    // svgAttr.class = lineProp.class || this.cfg.cssClass[lineProp.type];
    svg.attr({ class: "staxis wcandle" });
  }


  // Lines.prototype.getId = function (elemID, snap = false) {
  //   var elem;
  //   elem = snap
  //     ? this.snap.select("#" + elemID)
  //     : document.getElementById(elemID);
  //   return elem || 0;
  // };

  getId(elemId) {
    return document.getElementById(elemId);
  }
}

export default Chart;