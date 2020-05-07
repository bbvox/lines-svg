const store = require("./store");
const utils = require("./utils");
const { config: cfg } = require("./config");

const Calc = require("./calc");

class ChartBase {
  constructor(elemId) {
    if (!window.getComputedStyle) {
      return;
    }

    this.elId = elemId;
    this.el = this.getId(elemId);
    this.snap = window.Snap("#" + elemId);

    this.setup();
  }

  setup() {
    this.init();
    this.calc = new Calc();
  }

  init() {
    let { height, width } = window.getComputedStyle(this.el);
    width = utils.f(width, 0);
    height = utils.f(height, 0);
    const chartHeight = height - cfg.chart.paddingY * 2;
    // axisX - position of  
    this.area = {
      w: width,
      h: height,
      width: width - cfg.chart.paddingY * 2,
      height: chartHeight,
      endX: width - cfg.chart.paddingX,
      zeroX: cfg.chart.paddingX,
      zeroY: height - cfg.chart.paddingY,
      ordinateX: cfg.chart.paddingX / 2,
      offsetLeft: this.el.offsetLeft || this.el.parentElement.offsetLeft || 0,
      offsetTop: this.el.offsetTop || this.el.parentElement.offsetTop || 0,
      gridStep: utils.f(chartHeight / cfg.chart.totalGrids, 0), // yAxis
    };

    store.set("area", this.area);
  }

  data(chartData) {
    if (!(chartData instanceof Array)) {
      throw new Error("Missing chart data !");
    }
    store.save(chartData);

    this.calc.start();
    this.calc.main();
  }

  deleteAll() {
    const svgRoot = this.el;
    while (svgRoot.firstChild) {
      svgRoot.removeChild(svgRoot.lastChild);
    }
    // reset internal groupCandle
    this.groupCandle = false;
  }

  drawAll() {
    this.drawAxis();
    this.drawCandle();
    this.drawLine();
    this.drawSma();
    this.drawEma();
  }

  drawAxis() {
    this.drawLabelsX();
    this.drawLabelsY();
  }

  drawLabelsX() {
    const labels = store.get("labels");
    const points = store.get("points", "line");

    const yAxis = Math.floor(this.area.zeroY + cfg.chart.paddingY / 2);
    // points & labels are same length
    labels.forEach((labelDate, idx) => {
      const xAxis = points[idx][0];
      const label = utils.fDate(labelDate);
      this.svgText({ point: [xAxis, yAxis], label, groupFlag: true });
    });
  }

  drawLabelsY() {
    const { enableGrid, totalGrids } = cfg.chart;
    const { endX, gridStep } = this.area;

    let { point: [xAxis, yAxis], label, labelDiff } = this.calc.yAxis();
    let gridPath = "";
    [...Array(totalGrids + 1)].forEach(() => {
      this.svgText({ point: [xAxis, yAxis], label });

      if (enableGrid) {
        gridPath += this.getPath([xAxis, yAxis], [endX, yAxis]);
      }
      yAxis -= gridStep;
      label = utils.f(label + labelDiff);
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

  svgDebug(point = []) {
    if (cfg.debug) {
      this.svgCircle(point);
    }
  }

  svgRectGroup() {
    const { candleWin, candleLose } = cfg.svg.rect;
    this.groupCandle = {
      candleWin: this.snap.group().attr(candleWin),
      candleLose: this.snap.group().attr(candleLose),
    };
  }

  // svg METHODs - svgElement
  svgCircle(point, type = "debug") {
    const svgElem = this.snap.circle({ cx: point[0], cy: point[1], r: 3 });

    return svgElem.attr(cfg.svg.circle[type] || {});
  }

  //x,y,width,height
  // candles are in two groups : candleWin & candleLose
  svgRect(rectData, rectType = false) {
    if (!this.groupCandle) {
      this.svgRectGroup();
    }

    // add to candle Group
    this.groupCandle[rectType].add(this.snap.rect(rectData));
  }

  svgText({ point, label, groupFlag }, elemId = false) {
    const svgElem = this.snap.text(point[0], point[1], label);
    elemId && svgElem.attr({ id: elemId });
    return svgElem;
  }

  svgLine(point, point1) {
    const svgElem = this.snap.line(...point, ...point1);
    return svgElem.attr(cfg.svg.line);
  }

  svgPath(path, pathType = "line") {
    let svgElem = this.snap
      .path(path)
      .attr({ stroke: `#${cfg.colors[pathType]}` });

    if (this.isCandle(pathType)) {
      svgElem = this.groupCandle[pathType].add(svgElem);
    } else if (pathType === "grid") {
      svgElem.attr({ "stroke-dasharray": "5,10" });
    } else {
      svgElem.attr({ id: pathType });
    }
  }

  isCandle(checkType) {
    return ["candleWin", "candleLose"].includes(checkType);
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
