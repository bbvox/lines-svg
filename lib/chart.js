import store from "./store";
import utils from "./utils";

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
      endX: width - cfg.chart.padding,
      zeroX: cfg.chart.padding,
      zeroY: height - cfg.chart.padding,
      offsetLeft: this.el.offsetLeft || this.el.parentElement.offsetLeft || 0,
      offsetTop: this.el.offsetTop || this.el.parentElement.offsetTop || 0,
      gridStep: utils.f(height / cfg.chart.totalGrids, 0) // yAxis
    }

    store.set("area", this.area);
  }

  drawAxis() {
    this.drawLabelsX();
    this.drawLabelsY();
  }

  drawLabelsX() {
    const { labels, points } =
      store.mget(["labels", "points"]);

    const yAxis = Math.floor(this.area.zeroY + cfg.chart.padding / 2);

    // points & labels are same length
    labels.forEach((labelDate, idx) => {
      const xAxis = points[idx][0];
      const label = utils.fDate(labelDate);

      this.svgText({ xAxis, yAxis, label });
    });
  }

  //too difficult ...
  drawLabelsY() {
    const { amplitude, min } = store.mget(["amplitude", "min"]);
    const { enableGrid, totalGrids } = cfg.chart;
    const { endX, zeroX, zeroY, gridStep } = this.area;
    // difference between two labels
    const labelDiff = utils.f(amplitude * (1 / totalGrids), 4);
    const xAxis = zeroX;
    let yAxis = zeroY;

    let label = min;

    // dummy array instead of for loop
    const dummy = [...Array(totalGrids)];
    let chartGridPath = "";
    dummy.forEach((v, idx) => {
      this.svgText({ xAxis, yAxis, label });
      yAxis -= gridStep;
      label = utils.f(label + labelDiff, 5);

      if (enableGrid) {
        chartGridPath += this.getPath([xAxis, yAxis], [endX, yAxis]);
      }
    });
    enableGrid && this.svgPath(chartGridPath);
  }

  drawLine() {
    const { points, len } = store.mget(["points", "len"]);
    // index start from 0 & ignore last point
    const lastIndex = len - 1;
    let pk = 0;
    let path = "";
    for (; pk < lastIndex; pk++) {
      path += this.getPath(points[pk], points[pk + 1]);
      this.debug(points[pk]);
    }

    this.svgPath(path);
  }

  debug(point) {
    // const circle = this.snap.circle({ cx: point[0], cy: point[1], r: 3 });
    this.snap.circle({ cx: point[0], cy: point[1], r: 3 });
  }

  getPath(point1, point2) {
    let path = `M${Math.floor(point1[0])} ${Math.floor(point1[1])}`;
    path += `L${Math.floor(point2[0])} ${Math.floor(point2[1])}`;

    return path;
  }

  svgText({ xAxis, yAxis, label }) {
    xAxis -= 5;
    // this.snap.text(xAxis - 5, lineAxis[0][1] + 15, xlabel);
    // svg.attr({ class: this.cfg.cssClass.textLabel });
    // svg.attr(this.cfg.chart.textAttr);
    this.snap.text(xAxis, yAxis, label);
  }

  svgPath(path) {
    let pathElem = this.snap.path(path).attr({ class: "stline" });
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