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
    this.group = this.snap.group();
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
    const labels = store.get("labels");
    const points = store.get("points", "line");

    const yAxis = Math.floor(this.area.zeroY + cfg.chart.padding / 2);
    // points & labels are same length
    labels.forEach((labelDate, idx) => {
      const xAxis = points[idx][0];
      const label = utils.fDate(labelDate);
      this.svgText({ point: [xAxis, yAxis], label, group: true });
    });
  }

  drawLabelsY() {
    const { enableGrid, totalGrids } = cfg.chart;
    const { endX, gridStep } = this.area;

    let { xAxis, yAxis, label, labelDiff } = this.calc.yAxis();
    let gridPath = "";
    [...Array(totalGrids + 1)].forEach(() => {
      this.svgText({ point: [xAxis, yAxis], label });

      if (enableGrid) {
        gridPath += this.getPath([xAxis, yAxis], [endX, yAxis]);
      }
      yAxis -= gridStep;
      label = utils.f(label + labelDiff, 5);
    });

    enableGrid && this.svgPath(gridPath, "grid");
  }

  drawLine() {
    const points = store.get("points", "line");
    this.svgPath(this.getPathFromPoints(points), "line");
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
  svgDebug(point = []) {
    if (cfg.debug) {
      this.svgCircle(point);
    }
  }

  svgCircle(point, type = "debug") {
    const circleElem = this.snap.circle({ cx: point[0], cy: point[1], r: 3 });
    if (type === "cursor") {
      circleElem.attr({
        fill: `#${cfg.colors[type].fill}`,
        strokeWidth: 9,
        stroke: `#${cfg.colors[type].stroke}`,
        id: "liveCursor",
      });
    } else if (type === "liveNav") {
      circleElem.attr({
        class: "liveNav",
        r: 10,
      });
      // display: "none"
    }
    this.group.add(circleElem);
    return circleElem;
  }

  //x,y,width,height
  // candles are in two groups : candleWin & candleLose
  svgRect(rectData, rectType = false) {
    this.cgroup || (this.cgroup = {});

    // cgroup - for show/hide candle charts
    if (!this.cgroup[rectType]) {
      this.cgroup[rectType] = this.snap.group(this.snap.rect(rectData));
      this.cgroup[rectType].attr({
        stroke: `#${cfg.colors[rectType]}`,
        fill: `#${cfg.colors[rectType]}`,
        id: rectType,
      });
    } else {
      this.cgroup[rectType].add(this.snap.rect(rectData));
    }
    // nested group
    this.group.add(this.cgroup[rectType]);
  }

  svgText({ point, label, group }, elemId = false) {
    const textElem = this.snap.text(point[0] - 5, point[1], label);
    elemId && textElem.attr({ id: elemId });
    group && this.group.add(textElem);
    return textElem;
  }

  svgLine(point, point1) {
    return this.snap.line(...point, ...point1).attr({
      stroke: `#${cfg.colors.lline}`,
      strokeWidth: 5,
      class: "liveLine",
    });
  }

  svgPath(path, pathType = "line") {
    const svg = this.snap
      .path(path)
      .attr({ stroke: `#${cfg.colors[pathType]}` });

    if (pathType === "candleWin" || pathType === "candleLose") {
      this.cgroup[pathType].add(svg);
    } else {
      svg.attr({ id: pathType });
    }

    if (pathType === "grid") {
      svg.attr({ "stroke-dasharray": "5,10" });
    }

    this.group.add(svg);
  }

  toBase64() {
    let svg64 = new XMLSerializer().serializeToString(this.el);
    svg64 = btoa(svg64);

    return "data:image/svg+xml;base64," + svg64;
  }

  /**
   * liveMove
   * - fire callback with 3 states = start, move, end
   * - one click activate mouseMove bind to whole svg
   * @param {Function} cb - callback
   */
  liveMove(cb) {
    let click = 0;
    const { offsetLeft, offsetTop } = store.get("area");
    this.snap.unclick();
    this.snap.click((e, x, y) => {
      console.log("click");
      const point = [x - offsetLeft, y - offsetTop];
      !click && cb("start", point);
      click++;
      if (click === 1) {
        this.snap.unmousemove();
        this.snap.mousemove(function (e, dx, dy) {
          if (!(dx % 5)) {
            const point2 = [dx - offsetLeft, dy - offsetTop];
            cb("move", point2);
          }
        });
      } else if (click === 2) {
        this.snap.unclick();
        this.snap.unmousemove();
        cb("end");
      }
    });
  }

  getId(elemId) {
    return document.getElementById(elemId);
  }
}

module.exports = ChartBase;
