const store = require("./store");
const utils = require("./utils");

const { config: cfg } = require("./config");

class ChartBase {
  constructor(elemId, calcInstance) {
    if (!window.getComputedStyle) {
      return;
    }

    this.el = this.getId(elemId);
    this.snap = window.Snap("#" + elemId);
    this.calc = calcInstance;

    this.init();
  }

  init() {
    const elemStyle = window.getComputedStyle(this.el);
    const width = utils.f(elemStyle.width, 0);
    const height = utils.f(elemStyle.height, 0);
    const chartHeight = height - cfg.chart.padding * 2;
    this.area = {
      w: width,
      h: height,
      width: width - cfg.chart.padding * 2,
      height: chartHeight,
      endX: width - cfg.chart.padding,
      zeroX: cfg.chart.padding,
      zeroY: height - cfg.chart.padding,
      offsetLeft: this.el.offsetLeft || this.el.parentElement.offsetLeft || 0,
      offsetTop: this.el.offsetTop || this.el.parentElement.offsetTop || 0,
      gridStep: utils.f(chartHeight / cfg.chart.totalGrids, 0), // yAxis
    };

    store.set("area", this.area);
  }

  drawAxis() {
    this.drawLabelsX();
    this.drawLabelsY();
  }

  drawLabelsX() {
    const { labels, points } = store.mget(["labels", "points"]);
    const yAxis = Math.floor(this.area.zeroY + cfg.chart.padding / 2);
    // points & labels are same length
    labels.forEach((labelDate, idx) => {
      const xAxis = points[idx][0];
      const label = utils.fDate(labelDate);
      this.svgText({ xAxis, yAxis, label });
    });
  }

  drawLabelsY() {
    const { enableGrid, totalGrids } = cfg.chart;
    const { endX, gridStep } = this.area;

    let { xAxis, yAxis, label, labelDiff } = this.calc.yAxis();
    let gridPath = "";
    [...Array(totalGrids + 1)].forEach(() => {
      this.svgText({ xAxis, yAxis, label });

      if (enableGrid) {
        gridPath += this.getPath([xAxis, yAxis], [endX, yAxis]);
      }
      yAxis -= gridStep;
      label = utils.f(label + labelDiff, 5);
    });

    enableGrid && this.svgPath(gridPath, cfg.cssClass.grid);
  }

  drawLine() {
    const points = store.get("points");

    this.svgPath(this.getPathFromPoints(points), "stsma");
  }

  /**
   * getPathFromPoints
   * @param {Array} points - axis points
   * @returns {String} path
   */
  getPathFromPoints(points) {
    let [idx, path, len] = [0, "", points.length - 1];

    for (; idx < len; idx++) {
      path += this.getPath(points[idx], points[idx + 1]);
      this.svgDebug(points[idx]);
    }
    return path;
  }

  getPath(point1, point2) {
    let path = `M${Math.floor(point1[0])} ${Math.floor(point1[1])}`;
    path += `L${Math.floor(point2[0])} ${Math.floor(point2[1])}`;

    return path;
  }

  //if method have svg prefix depend on svg
  svgDebug(points = []) {
    if (cfg.debug) {
      this.snap.circle({ cx: points[0], cy: points[1], r: 3 });
    }
  }

  //x,y,width,height
  svgRect(rectData, rectClass = false) {
    const rect = this.snap.rect(rectData);
    rectClass && rect.attr({ class: rectClass });
  }

  svgText({ xAxis, yAxis, label }) {
    this.snap.text(xAxis - 5, yAxis, label);
  }

  svgPath(path, className = "stline") {
    this.snap.path(path).attr({ class: className });
  }

  getId(elemId) {
    return document.getElementById(elemId);
  }
}

module.exports = ChartBase;
