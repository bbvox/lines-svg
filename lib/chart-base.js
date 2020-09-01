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
      zeroX: cfg.chart.paddingX + 5,
      zeroY: height - cfg.chart.paddingY,
      ordinateX: cfg.chart.paddingX / 2,
      offsetLeft: this.el.offsetLeft || this.el.parentElement.offsetLeft || 0,
      offsetTop: this.el.offsetTop || this.el.parentElement.offsetTop || 0,
      gridStep: utils.f(chartHeight / cfg.chart.totalGrids, 0)
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

  // one & multi elements
  delete(element) {
    if (Array.isArray(element)) {
      element.forEach(el => el && el.remove());
    } else {
      element.remove();
    }
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
      if (idx % 2 && points.length > cfg.chart.labelXskipLength) return; // if too much elements print only even xLabels
      const [xAxis] = points[idx];
      const label = utils.fDate(labelDate);
      this.svgText({ point: [xAxis, yAxis], label, groupFlag: true });
    });
  }

  drawLabelsY() {
    const { enableGrid, totalGrids } = cfg.chart;
    const { endX, gridStep } = this.area;

    let {
      point: [xAxis, yAxis],
      label,
      stepYValue
    } = this.calc.yAxis();
    let gridPath = "";
    [...Array(totalGrids + 1)].forEach(() => {
      this.svgText({ point: [xAxis, yAxis], label });

      if (enableGrid) {
        gridPath += this.getPath([xAxis, yAxis], [endX, yAxis]);
      }
      yAxis -= gridStep;
      label = utils.f(label + stepYValue);
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
      this.svgDot(point);
    }
  }

  svgRectGroup() {
    const { candleWin, candleLose } = cfg.svg.rectGroup;
    this.groupCandle = {
      candleWin: this.snap.group().attr(candleWin),
      candleLose: this.snap.group().attr(candleLose)
    };
  }

  // svg METHODs - svgElement
  svgDot(point, type = "debug", elemId) {
    const svgElem = this.snap.circle({ cx: point[0], cy: point[1], r: 9 });
    elemId && svgElem.attr({ id: elemId });
    return svgElem.attr(cfg.svg.circle[type] || {});
  }

  //x,y,width,height
  svgRect(rectData, type = false, elemId) {
    if (!this.groupCandle) {
      this.svgRectGroup();
    }

    const svgElem = this.snap.rect(rectData);
    // candles are in two groups : candleWin & candleLose
    this.isCandle(type) && this.groupCandle[type].add(svgElem);
    elemId && svgElem.attr({ id: elemId });
    return svgElem.attr(cfg.svg.rect[type] || {});
  }

  svgText({ point, label, groupFlag }, elemId = false) {
    const svgElem = this.snap.text(point[0], point[1], label);
    elemId && svgElem.attr({ id: elemId });
    return svgElem;
  }

  /**
   * svgLine
   *  draw svg LINE element
   * @param {Array} point - [X1, Y1]
   * @param {Array} point1 - [X2, Y2]
   * @param {String} elemId - element ID
   *
   * @returns {elem} - DOM Element
   */
  svgLine(point, point1, elemId = false) {
    const svgElem = this.snap.line(...point, ...point1);
    elemId && svgElem.attr({ id: elemId });
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
   * @param {boolean} doubleClick - callback
   */
  liveMove(cb, doubleClick = false) {
    let click = 0;
    const { offsetLeft, offsetTop } = store.get("area");
    this.snap.unclick();
    this.snap.click((e, x, y) => {
      const point = [x - offsetLeft, y - offsetTop];
      !click && cb("start", point);
      click++;
      if (click === 1) {
        this.snap.unmousemove();
        this.snap.mousemove(function(e, dx, dy) {
          if (!(dx % 5)) {
            const point2 = [dx - offsetLeft, dy - offsetTop];
            cb("move", point2);
          }
        });
      } else if (click === 2 && doubleClick) {
        this.snap.unmousemove();
        this.snap.mousemove(function(e, dx, dy) {
          if (!(dx % 2)) {
            const point2 = [dx - offsetLeft, dy - offsetTop];
            cb("double", point2);
          }
        });
      } else {
        this.snap.unclick();
        this.snap.unmousemove();
        cb("end");
      }
    });
  }

  /**
   * liveDot
   * - move the live dot with mouse drag
   * @param {Object} {elemDrag, elemNav}
   *  - elemDrag element on which will be perform drag process
   *  - elemNav element which perform action
   * @param {function} moveCb - fire on each mouse move
   * @param {function} finishCb - fire after finish the process
   */
  liveDot(elemNav, moveCb, finishCb, verticalOnly = false) {
    const { offsetLeft, offsetTop } = store.get("area");
    elemNav &&
      elemNav.drag(
        (dx, dy, posx, posy) => {
          if (dx % 5 && dy % 5) {
            return;
          }
          const point = [posx - offsetLeft, posy - offsetTop];
          if (verticalOnly) {
            elemNav.attr({ cy: point[1] });
          } else {
            elemNav.attr({ cx: point[0], cy: point[1] });
          }
          moveCb && moveCb(point);
        },
        () => {},
        () => {
          finishCb && finishCb();
        }
      );
  }

  // check if liveDot exists
  // if dots exist delete them
  liveDotDelete(elemId) {
    const ids = [`${elemId}-nav1`, `${elemId}-nav2`];

    if (this.getId(ids[0])) {
      this.getId(ids[0]).remove();
      if (this.getId(ids[1])) {
        this.getId(ids[1]).remove();
      }
      return true;
    }

    return false;
  }

  getId(elemId) {
    return document.getElementById(elemId);
  }

  getIdSnap(elemId) {
    return this.snap.select(`#${elemId}`);
  }

  /**
   * getIdAttr -
   *  get multi attributes from element with id
   * @param {String} elemId
   * @param {Array} attrs - ['x', 'y']
   *
   * @returns {Object} with attributes values
   * @example {x: 10, y: 20}
   */
  getIdAttr(elemId, attrs) {
    const elem = this.getId(elemId);

    return attrs.reduce(
      (acc, attrName) => ({
        ...acc,
        [attrName]: parseInt(elem.getAttribute(attrName))
      }),
      {}
    );
  }

  // based on native DOM not snapSvg
  getElem(typeElem, attrData) {
    let elem;
    if (typeElem === "root") {
      elem = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "foreignObject"
      );
    } else if (typeElem === "div") {
      elem = document.createElement("div");
    } else if (typeElem === "text") {
      elem = document.createTextNode(attrData);
    }

    if (typeof attrData === "object") {
      Object.keys(attrData).forEach(attr => {
        elem.setAttribute(attr, attrData[attr]);
      });
    }

    return elem;
  }

  /**
   * textSvg
   *  based on native DOM not snapSvg
   * @param {point} axis point - [axisX, axisY]
   *
   * @returns {Node} - snapSvg
   */
  textSvg(point, elemId) {
    const elemRoot = this.getElem("root", {
      width: 110,
      height: 90,
      x: point[0],
      y: point[1],
      id: elemId,
      style: "cursor:pointer;"
    });

    const elemDiv = this.getElem("div", {
      contenteditable: true,
      style: "color:black; background: white; opacity: 0.75;",
      class: "ltxt"
    });

    const elemText = this.getElem("text", "Your comments");
    elemDiv.appendChild(elemText);
    elemRoot.appendChild(elemDiv);

    return this.snap.add(elemRoot);
  }
}

module.exports = ChartBase;
