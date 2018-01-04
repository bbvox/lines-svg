var Lines = Lines || {};

(function() {
  "use strict";

  Lines = function(elemId) {
    if (!this.getId(elemId)) {
      throw new Error("Missing SVG DOM Element !");
    } else if (!window.Snap) {
      throw Error("Missing Snap.svg library !");
    }

    this.el = this.getId(elemId);
    this.snap = window.Snap("#" + elemId);

    this.setupChart();
  };

  // Debug flag. 
  Lines.prototype.debug = false;

  // Contstant TYPESVG
  Lines.prototype.TYPESVG = {
    line: "line",
    text: "text",
    rect: "rect",
    circle: "circle",
    path: "path",
    input: "input"
  };

  // Constant TYPE of charts
  Lines.prototype.TYPE = {
    axis: "axis",
    legend: "legend",
    debug: "debug",
    sinit: "sinit",
    init: "init",
    line: "line",
    candle: "candle",
    sma: "sma",
    ema: "ema"
  };

  // Chart DOM elements
  // this.elms.TYPE.elemID.elem - snapSVG element
  // this.elms.TYPE.elemID.color - color for this element
  Lines.prototype.elms = {
    id: []
  };

  // Chart Live DOM elements
  // lelms.TYPE.elemID >>> 
  //  - lelems.nav["navdot1"] = element
  //  - lelems.line["live-line-2-3"] = element
  // ID of element determine which navID belong to him
  // action: {draw: true, drag: false}
  Lines.prototype.lelms = {
    id: [],
    navid: [],
    last: false,
    nav: false,
    line: false,
    arrow: false,
    action: {}
  };

  // Dataset
  // sinit > secure init did not reset after 
  Lines.prototype.dset = {
    sinit: {},
    init: { raw: [], labels: [], min: 0, max: 0, stepX: 0, stepY: 0, zeroY: 0 },
    line: { points: [], lastX: 0, lastY: 0 },
    candle: { width: 0, winp: [], losep: [] },
    sma: { data: [], points: [], lastX: 0, lastY: 0 },
    ema: { data: [], points: [], lastX: 0, lastY: 0 }
  };

  // Store draw methods for tail execution during animation
  // toDo - remove/combine it with cfg.DrawOrder
  Lines.prototype.drawOrder = [];

  // Configuration section:
  //  - chart = properties for the chart. 
  //  - - padding: use to calculate drawable area for chart. 
  //      usable width = totalWidth - 2 * padding
  //  - - candleFill is ratio candle width is 0.4 part from x step
  //  - cssClass = classes for each chart type. 
  Lines.prototype.cfg = {
    animate: false,
    zoomMove: true,
    chart: {
      type: ["line", "candle", "sma", "ema"],
      padding: 30,
      attr: { stroke: "#ddd", fill: "none", strokeWidth: 1 },
      textAttr: { "stroke-width": "0.1px", "font-family": "Verdana", "font-size": "12px", fill: "#000" },
      textBold: { "font-weight": "bold" },
      enableGrid: true,
      candleFill: 0.4,
      grids: 5,
      navDot: 6 // radius
    },
    cssClass: {
      textLabel: "tlabel",
      liveLabel: "llabel",
      liveLine: "lline",
      liveDot: "ldot",
      winCandle: "wcandle",
      loseCandle: "lcandle",
      debugDot: "ddot",
      line: "stline",
      sma: "stsma",
      ema: "stema",
      axis: "staxis",
      navDot: "stnavdot",
      moveNavDot: "movedot",
      rotateNavDot: "rotatedot"
    },
    smaLength: 5,
    emaLength: 10,
    magnetMode: 50,
    step: {
      x: 50,
      xMin: 20,
      xMax: 100,
      yMax: 20,
      arrow: 50,
      zoom: 9,
      offset: 9,
      xLegend: 100
    },
    debug: {
      radius: 6,
      attr: { stroke: "red" }
    },
    timeUnit: "15m",
    timeUnits: ["15m", "30m", "1h", "4h", "1d", "1w"], //supported TIME UNITS
    drawOrder: ["drawLine", "drawCandle", "drawSMA", "drawEMA"]
  };

  // Internal method 
  // - define chartArea which hold main chart dimensions
  Lines.prototype.setupChart = function() {
    var elementStyle, width, height;

    if (!window.getComputedStyle) {
      return;
    }

    elementStyle = window.getComputedStyle(this.el);
    width = parseInt(elementStyle.width);
    height = parseInt(elementStyle.height);

    this.chartArea = {
      w: width,
      h: height,
      width: (width - (this.cfg.chart.padding * 2)),
      height: (height - (this.cfg.chart.padding * 2)),
      endX: this.cfg.chart.padding,
      zeroX: this.cfg.chart.padding,
      zeroY: height - this.cfg.chart.padding,
      offsetLeft: this.el.offsetLeft || this.el.parentElement.offsetLeft || 0,
      offsetTop: this.el.offsetTop || this.el.parentElement.offsetTop || 0
    };
    // invert the chart start from left to right
    this.chartArea.zeroX = this.chartArea.width;
    // check if snap exist. for testing purposes
    this.snap && this.snap.attr(this.cfg.chart.attr);

    if (this.snap && this.cfg.zoomMove) {
      this.chartEvents();
    }
  };

  Lines.prototype.events = {
    wheel: false
  };

  // bind global Events for whole chart
  // mouseWheel
  // mouse Drag
  // once Per interaction throught debounce
  Lines.prototype.chartEvents = function() {
    var _debounce, self = this;


    _debounce = function(cb, wait) {
      var timeout;
      return function() {
        var action = {},
          args = arguments;
        action.draw = self.gl({ type: "action", prop: "draw" });
        action.drag = self.gl({ type: "action", prop: "drag" });
        //check draw or drag 
        if (action.draw || action.drag) {
          return;
        }
        arguments[0].preventDefault && arguments[0].preventDefault();
        var later = function() {
          timeout = null;
          cb.apply(self, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    };

    if (!this.cfg.zoomMove) {
      this.el.removeEventListener("wheel", _debounce(this.cbEvent, 300), false);
      return;
    }

    if (!this.events.wheel) {
      this.events.wheel = true;
      this.el.addEventListener("wheel", _debounce(this.cbEvent, 300), false);
    }

    if (!this.events.drag) {
      this.events.drag = true;
      this.snap.drag(_debounce(this.cbEvent, 300));
    }
  };

  // set config parameters
  // support deep config
  Lines.prototype.setup = function(setupData) {
    var prop1, prop2;
    for (prop1 in setupData) {
      if (typeof setupData[prop1] === "object") {
        for (prop2 in setupData[prop1]) {
          if (this.cfg[prop1][prop2]) {
            this.cfg[prop1][prop2] = setupData[prop1][prop2];
          }
        }
      } else if (this.cfg[prop1]) {
        this.cfg[prop1] = setupData[prop1];
      }
    }
    this.setupChart();
  };

  // for wheel -> wheelDelta >>> zoom
  // for drag -> dx, dy, posx, posy >>> move
  Lines.prototype.cbEvent = function() {
    var param;
    if (arguments[0] && (arguments[0].wheelDelta || arguments[0].deltaY)) {
      param = arguments[0].wheelDelta || arguments[0].deltaY;
      this.zoom(param > 0 ? "in" : "out");
    } else if (arguments.length === 5) {
      param = arguments[0];
      this.move(param > 0 ? "prev" : "next");
    }
  };

  // Interface method
  // check dataArray, handle dataArray
  Lines.prototype.data = function(dataArray) {
    if (!(dataArray instanceof Array)) {
      return;
    }
    var labels, validData = [];
    if (dataArray[0].date || dataArray[0].high) {
      validData = this.formatData(dataArray);

      labels = validData.map(item => item[4]);
    } else {
      validData = dataArray;
      //remove this !!!
      // validData = dataArray.reverse();
      labels = validData.map(item => item[4]);
    }

    //store whole array into this.dset.init.raw
    this.s({ type: this.TYPE.init, prop: "raw" }, validData);
    if (labels) {
      this.s({ type: this.TYPE.init, prop: "labels" }, labels);
    }

    // get close values for our MAIN DATA array
    // OHLC - Open High Low Close
    var data = validData.map(item => this.f(item[3], 5));
    this.s({ type: this.TYPE.line, prop: "data" }, data);

    //recover values from sinit
    this.restore();
    if (this.checkLen()) {
      this.dataInit();
      this.calculate();
    }
  };

  //[{open, high, low, close}]
  Lines.prototype.formatData = function(dataRaw) {
    var validData;

    validData = dataRaw.map(row => [row.open,
      row.high,
      row.low,
      row.close,
      row.date
    ]);
    return validData;
  };

  // Internal method
  // - check data length
  // if data is more than available slots slice it
  // start again 
  // toDo create pagging
  Lines.prototype.checkLen = function() {
    var data, stepX, perPage;

    data = this.gg("data");
    stepX = this.gg("stepX") || this.f((this.chartArea.width / data.length), 0);

    if (stepX > this.cfg.step.xMax) {
      stepX = this.cfg.step.xMax;
    } else if (stepX < this.cfg.step.xMin) {
      stepX = this.cfg.step.xMin;
    }
    this.s({ type: this.TYPE.init, prop: "stepX" }, stepX);

    perPage = this.f(this.chartArea.width / stepX, 0);
    if (stepX < 50) perPage -= 1;
    if (data.length > perPage) {
      var offset, cuttedData, raw, slice = {};

      raw = this.gg("raw");
      this.s({ type: this.TYPE.sinit, prop: "allraw" }, raw);

      this.s({ type: this.TYPE.sinit, prop: "labels" }, this.gg("labels"));
      offset = this.g({ type: this.TYPE.sinit, prop: "offset" }) || 0;
      slice = {
        begin: (offset > 0) ? offset : 0,
        end: perPage + offset
      };
      // slice
      cuttedData = raw.slice(slice.begin, slice.end);
      this.s({ type: this.TYPE.sinit, prop: "slice" }, slice);
      this.reset();
      this.data(cuttedData);
      return false;
    }

    return true;
  };

  // initialize data set
  // calculate min, max value based on input data
  Lines.prototype.dataInit = function() {
    var data, min, max;

    data = this.gg("data");
    min = max = data[0];
    data.map(item => {
      if (min > item)
        min = item;
      if (max < item)
        max = item;
    });

    this.s({ type: this.TYPE.init, prop: "min" }, min);
    this.s({ type: this.TYPE.init, prop: "max" }, max);

    this.periodInit();
    this.zeroInit();
  };

  // calc stepY
  Lines.prototype.periodInit = function() {
    var step = {},
      amplitude;

    amplitude = this.f((this.gg("max") - this.gg("min")), 5);
    this.s({ type: this.TYPE.init, prop: "amplitude" }, amplitude);

    step.y = this.f((this.chartArea.height / amplitude), 0);
    this.s({ type: this.TYPE.init, prop: "stepY" }, step.y); //stepY - important !!!
  };

  //define zeroX & zeroY
  Lines.prototype.zeroInit = function() {
    var data, zeroY;
    data = this.gg("data");

    this.s({ type: this.TYPE.init, prop: "zeroX" }, this.chartArea.zeroX);

    zeroY = this.chartArea.zeroY - ((data[0] - this.gg("min")) * this.gg("stepY")); //???

    zeroY = this.f(zeroY, 0);
    this.s({ type: this.TYPE.init, prop: "zeroY" }, zeroY);
  };

  // CALCULATE LINE CHART AXIS POINTS //////////
  // calculate axis points and store it into lines.points
  // pointOne = [axisX, axisY]
  // this.TYPE.points = [[x0,y0], [x1, y1].....[x88,y88]]
  Lines.prototype.calculate = function() {
    var data, pointLength, pIndex = 1,
      pointOne = [];

    data = this.gg("data");

    pointOne[0] = this.gg("zeroX");
    pointOne[1] = this.gg("zeroY");

    // clear points and assign pointOne [axisX, axisY]
    this.s({ type: this.TYPE.line, prop: "points" }, []);
    this.add({ type: this.TYPE.line, prop: "points" }, pointOne);

    this.s({ type: this.TYPE.line, prop: "lastX" }, pointOne[0]);
    this.s({ type: this.TYPE.line, prop: "lastY" }, pointOne[1]);

    pointLength = data.length;
    for (; pIndex < pointLength; pIndex++) {
      (this.calcPoint)(pIndex);
    }
  };

  /**
   * calcPoint.
   * @desc Calculate point Axis base on value
   * 
   * @param {number} dataIndex - The index of the point.
   * @param {string} chartType - Chart type.
   * @param {string} propPostfix - String which add at the end of property.
   */
  Lines.prototype.calcPoint = function(dataIndex, chartType = "line", propPostfix = "") {
    var prevDataValue, dataValue, diff, params = {};

    params.type = chartType;
    params.prop = "data" + propPostfix;
    prevDataValue = this.g(params)[dataIndex - 1];
    dataValue = this.g(params)[dataIndex];

    if (dataValue < prevDataValue) {
      diff = prevDataValue - dataValue;
      this.plus(diff, chartType, propPostfix);
    } else if (dataValue > prevDataValue) {
      diff = dataValue - prevDataValue;
      this.minus(diff, chartType, propPostfix);
    } else {
      this.equal(dataValue, chartType, propPostfix);
    }
  };

  /**
   * plus Method.
   * @desc increase lastX with stepX
   * @desc increase lastY with (increase * stepY)
   *
   * @param {number} increase - The difference from previous point data.
   * @param {string} chartType - Chart type from TYPE.
   * @param {string} propPostfix - String which add at the end of property.
   *
   *  calculated point add to points/pointsLength to corresponding chartType
   */
  Lines.prototype.plus = function(increase, chartType = "line", propPostfix) {
    var point = [],
      change = {};

    change.x = this.gg("stepX");
    point[0] = this.action({ type: chartType, prop: "lastX" + propPostfix }, { action: "-", value: change.x });

    change.y = this.f((increase * this.gg("stepY")), 5);
    point[1] = this.action({ type: chartType, prop: "lastY" + propPostfix }, { action: "+", value: change.y });

    this.add({ type: chartType, prop: "points" + propPostfix }, point);
  };

  /**
   * minus Method.
   * @desc increase lastX with stepX
   * @desc decrease lastY with (decrease * stepY)
   *
   * @param {number} decrease - The difference from previous point data.
   * @param {string} chartType - Chart type from TYPE.
   * @param {string} propPostfix - String which add at the end of property.
   *
   *  calculated point add to points/pointsLength to corresponding chartType
   */
  Lines.prototype.minus = function(decrease, chartType = "line", propPostfix) {
    var point = [],
      change = {};

    change.x = this.gg("stepX");
    point[0] = this.action({ type: chartType, prop: "lastX" + propPostfix }, { action: "-", value: change.x });

    change.y = this.f((decrease * this.gg("stepY")), 5);
    point[1] = this.action({ type: chartType, prop: "lastY" + propPostfix }, { action: "-", value: change.y });

    this.add({ type: chartType, prop: "points" + propPostfix }, point);
  };

  /**
   * equal Method.
   * @desc increase lastX with stepX
   * @desc did not change lastY
   *
   * @param {number} decrease - The difference from previous point data.
   * @param {string} chartType - Chart type from TYPE.
   * @param {string} propPostfix - String which add at the end of property.
   *
   *  calculated point add to points/pointsLength to corresponding chartType
   */
  Lines.prototype.equal = function(value, chartType = "line", propPostfix) {
    var point = {},
      change = {};

    change.x = this.gg("stepX");
    point[0] = this.action({ type: chartType, prop: "lastX" + propPostfix }, { action: "-", value: change.x });

    point[1] = this.g({ type: chartType, prop: "lastY" + propPostfix });

    this.add({ type: chartType, prop: "points" + propPostfix }, point);
  };

  /**
   * add Method.
   * @desc get data property if empty create
   * add new data and set 
   *
   * @param {object} addInfo - {type: this.TYPE, prop: "points" || "data"}.
   * @param {number} addData - data to push into array.
   *
   */
  Lines.prototype.add = function(addInfo, addData) {
    var points;
    points = this.g(addInfo) || [];
    points.push(addData);

    this.s(addInfo, points);
  };

  /*
                        _                            _   _               _     
     _ __ ___ _ __   __| | ___ _ __   _ __ ___   ___| |_| |__   ___   __| |___ 
    | '__/ _ \ '_ \ / _` |/ _ \ '__| | '_ ` _ \ / _ \ __| '_ \ / _ \ / _` / __|
    | | |  __/ | | | (_| |  __/ |    | | | | | |  __/ |_| | | | (_) | (_| \__ \
    |_|  \___|_| |_|\__,_|\___|_|    |_| |_| |_|\___|\__|_| |_|\___/ \__,_|___/
  */
  Lines.prototype.draw = function(type = "all", chartLength) {
    switch (type) {
      case this.TYPE.axis:
        this.drawAxis();
        break;
      case this.TYPE.line:
        this.drawLine();
        break;
      case this.TYPE.candle:
        this.drawCandle();
        break;
      case this.TYPE.sma:
        // this.drawOrder = ["drawLegend"];
        this.drawSMA(chartLength);
        break;
      case "ema":
        this.drawEMA(chartLength);
        break;
      case "all":
        if (this.cfg.animate) {
          this.drawOrder = this.cfg.drawOrder.slice(0);
          this.drawAxis();
        } else {
          this.drawAxis();
          this.drawLine();
          this.drawCandle();
          this.drawSMA();
          this.drawEMA();
          this.drawLegend();
        }
    }
  };

  /**
   * drawSVG Method.
   * @desc draw snap svg element
   *
   * @param {object} svgInfo - {type: this.TYPESVG, axis: [], attr: {}, id, class}.
   *
   * @return {object} svgObject
   */
  Lines.prototype.drawSVG = function(svgInfo = {}) {
    var svgData = {};
    switch (svgInfo.type) {
      case this.TYPESVG.rect:
        svgData.args = {
          x: svgInfo.axis[0],
          y: svgInfo.axis[1],
          width: svgInfo.w,
          height: svgInfo.h
        };
        break;
      case this.TYPESVG.text:
        svgData.args = {
          x: svgInfo.axis[0],
          y: svgInfo.axis[1],
          text: svgInfo.text
        };
        break;
      case this.TYPESVG.circle:
        svgData.args = {
          cx: svgInfo.axis[0],
          cy: svgInfo.axis[1],
          r: svgInfo.r
        };
        break;
    }

    // add class to attributes
    if (svgInfo.class) {
      svgInfo.attr = svgInfo.attr || {};
      svgInfo.attr.class = svgInfo.class;
    }
    //draw Element
    svgData.element = this.snap[svgInfo.type](svgData.args);
    svgInfo.id && (svgData.element.node.id = svgInfo.id);

    //add attributes to svg element
    if (svgInfo.attr) {
      svgData.attr = {};
      for (var attrKey in svgInfo.attr) {
        svgData.attr[attrKey] = svgInfo.attr[attrKey];
      }
      svgData.element.attr(svgData.attr);
    }

    return svgData.element;
  };

  /**
   * check Method.
   * @desc get data property if empty create
   * add new data and set 
   *
   * @param {object} elementInfo - {type: this.TYPE}.
   *
   */
  Lines.prototype.checkId = function(elementInfo) {
    var elemID;
    elemID = this.makeId(elementInfo);
    return (this.elms.id.indexOf(elemID) !== -1);
  };

  Lines.prototype.redraw = function(idArray) {
    var chart, key, fnName;

    idArray = idArray || this.elms.id;
    for (key in idArray) {
      chart = this.splitId(idArray[key]);
      fnName = "draw" + chart.type;
      this[fnName](chart.length || 0);
    }
  };

  Lines.prototype.getLabel = function(elemID) {
    var label = elemID.split("-");

    label.shift(); //remove "svg"
    return label.join(" ");
  };


  // only for SMA & EMA with period

  //dset.sma.length
  //dset.ema
  //toDo review this...
  Lines.prototype.drawLegend = function() {
    var yAxis, smaID, emaID;
    yAxis = this.chartArea.zeroY - 20;
    for (smaID in this.elms.sma) {
      this.prLegend({
        id: smaID,
        y: yAxis,
        label: this.getLabel(smaID),
        color: this.elms.sma[smaID].color || this.getStyle(smaID).stroke
      });
      yAxis -= 30;
    }

    for (emaID in this.elms.ema) {
      this.prLegend({
        id: emaID,
        y: yAxis,
        label: this.getLabel(emaID),
        color: this.elms.ema[emaID].color || this.getStyle(emaID).stroke
      });
      yAxis -= 30;
    }
  };

  // rowObj {y, label, color}
  Lines.prototype.prLegend = function(rowObj) {
    var svg = {},
      cube = {};
    cube.x = this.chartArea.w - this.cfg.step.xLegend;
    cube.y = rowObj.y;
    cube.width = cube.height = 20;

    svg.cubeInfo = {
      type: this.TYPESVG.rect,
      axis: [cube.x, cube.y],
      w: cube.width,
      h: cube.height,
      attr: { fill: rowObj.color }
    };
    svg.cube = this.drawSVG(svg.cubeInfo);

    svg.textInfo = {
      type: this.TYPESVG.text,
      axis: [cube.x + 30, cube.y + 15],
      text: rowObj.label,
      attr: { stroke: rowObj.color }
    };
    svg.text = this.drawSVG(svg.textInfo);

    this.store({ type: this.TYPE.legend }, svg.cube);
    this.store({ type: this.TYPE.legend }, svg.text);

    svg.text.click(() => {
      alert("click Legend" + rowObj.id);
      console.log("QUICK ANIMATION OF THE CHART WITH SOME BLANK COLOR >>>>", this);
    });
  };

  //draw empty Grid behind chart
  Lines.prototype.drawAxis = function() {
    var lineAxis = [],
      yAxis, _linePath = "",
      gridStep, lk = 0;

    if (this.checkId({ type: this.TYPE.axis })) {
      this.pr("Axis chart already exist");
      return;
    }

    if (!this.cfg.chart.enableGrid) {
      this.drawLabelsX();
      this.drawLabelsY();
      return;
    }

    gridStep = this.chartArea.height / this.cfg.chart.grids;
    this.s({ type: this.TYPE.init, prop: "gridstep" }, this.f(gridStep, 0));

    lineAxis[0] = [this.chartArea.endX, this.chartArea.zeroY];
    lineAxis[1] = [this.chartArea.zeroX, this.chartArea.zeroY];
    yAxis = lineAxis[0][1] = lineAxis[1][1];

    for (; lk <= this.cfg.chart.grids; lk++) {
      _linePath += "M" + lineAxis[0][0] + " " + yAxis + "L" + lineAxis[1][0] + " " + yAxis;
      yAxis = Math.floor(yAxis - gridStep);
    }
    this.printPath({ type: this.TYPE.axis, path: _linePath });

    this.drawLabelsX();
    this.drawLabelsY();
  };

  Lines.prototype.drawLabelsX = function() {
    var xAxis, lineAxis = [
        []
      ],
      plen, _linePath = "",
      svg, lk = 0,
      diff = 0,
      xlabel;

    plen = this.gg("points").length;
    // lineAxis[0][0] = this.chartArea.endX + this.gg("stepX");
    lineAxis[0][0] = this.chartArea.zeroX;
    lineAxis[0][1] = Math.floor(this.chartArea.zeroY + this.cfg.chart.padding / 2);
    lineAxis[1] = [lineAxis[0][0], lineAxis[0][1] + 5];
    xAxis = lineAxis[0][0] = lineAxis[1][0];
    if (this.cfg.timeUnit === "4h") {
      diff = 1;
    }

    for (; lk <= plen; lk++) {
      if ((lk % 3) === diff) {
        xlabel = this.dateTime(lk);
        _linePath += "M" + xAxis + " " + lineAxis[0][1] + "L" + xAxis + " " + lineAxis[1][1];
        svg = this.snap.text(xAxis - 5, lineAxis[0][1] + 15, xlabel);
        svg.attr({ class: this.cfg.cssClass.textLabel });
        svg.attr(this.cfg.chart.textAttr);
        switch (this.cfg.timeUnit) {
          case "15m":
            (xlabel.length === 2) && svg.attr(this.cfg.chart.textBold);
            break;
        }

        // if ((xlabel.length === 1 || xlabel.length === 2 || xlabel.length === 3) && this.cfg.timeUnit !== "1w" && this.cfg.timeUnit !== "1d") {
        //   svg.attr(this.cfg.chart.textBold);
        // } else if (xlabel.length > 2 && this.cfg.timeUnit !== "1h" && this.cfg.timeUnit !== "15m") {
        //   svg.attr(this.cfg.chart.textBold);
        // }

        this.store({ type: this.TYPE.axis }, svg);
      }
      xAxis -= this.gg("stepX");
    }
    this.printPath({ type: this.TYPE.axis, path: _linePath });
  };

  Lines.prototype.drawLabelsY = function() {
    var svg, txtStep, label, step, point;

    label = this.gg("min");
    txtStep = this.f(this.gg("amplitude") * (1 / this.cfg.chart.grids), 4);

    step = this.gg("gridstep");
    point = [this.chartArea.zeroX, this.chartArea.zeroY];

    for (var tK = 0; tK <= this.cfg.chart.grids; tK++) {
      svg = this.snap.text(point[0], point[1], this.f(label, 4));
      svg.attr({ class: this.cfg.cssClass.textLabel });
      svg.attr(this.cfg.chart.textAttr);
      this.store({ type: this.TYPE.axis }, svg);
      this.drawDebug(point);

      point[1] -= step;
      label += txtStep;
    }
  };

  // cuttedData = raw.slice(slice.begin, slice.end);
  Lines.prototype.dateTime = function(period) {
    var periodInfo = {};
    periodInfo.key = period + (this.gg("offset") || 0);

    periodInfo.value = this.gg("labels")[periodInfo.key];
    return this.formatDate(periodInfo.value);
  };

  // 1. calculate whole length width/stepX
  // 2. calculate one Period depend on cfg.timeUnit
  // 3. calculate begining of chart 
  // 
  // timeUnits: ["15m", "30m", "1h", "4h", "1d", "1w"], //supported TIME UNITS
  Lines.prototype.dateTimeOld = function(period) {
    var periodLength, timeLine = {};

    periodLength = this.chartArea.width / this.gg("stepX");
    periodLength = this.f(periodLength, 0) - 1;
    //add or subtrack offset 
    periodLength += this.g({ type: this.TYPE.init, prop: "offset" }) || 0;

    timeLine.perPeriod = this.dateUnit(); // in milliseconds
    if (period === periodLength) {
      timeLine.end = (new Date).getTime();
    } else {
      //should round end time
      // if it is 10.12 subtrack 12 min to become 10
      timeLine.end = (new Date).getTime();
      timeLine.diff = timeLine.end % timeLine.perPeriod;
      timeLine.end -= timeLine.diff;
    }
    timeLine.begin = timeLine.end - (timeLine.perPeriod * periodLength); //start scale
    timeLine.thisPeriod = timeLine.begin + (period * timeLine.perPeriod);

    return this.formatDate(timeLine.thisPeriod);
  };

  Lines.prototype.formatDate = function(timeStamp) {
    var base, dateFormat, months;
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    base = new Date(timeStamp);

    if (["15m", "30m"].indexOf(this.cfg.timeUnit) !== -1) {
      dateFormat = base.getHours();
      if (dateFormat === 0 && base.getMinutes() < 31) {
        dateFormat = base.getDate();
      } else {
        dateFormat += ":" + base.getMinutes();
      }
    } else if (["1h"].indexOf(this.cfg.timeUnit) !== -1) {
      dateFormat = base.getHours();
      if (dateFormat === 0 || dateFormat === 1 || dateFormat === 2) {
        dateFormat = base.getDate();
      } else {
        dateFormat += ":00";
      }
    } else if (["4h"].indexOf(this.cfg.timeUnit) !== -1) {
      dateFormat = base.getHours();
      if ([0, 1, 2, 3].indexOf(dateFormat) !== -1) {
        dateFormat = base.getDate();
      } else {
        dateFormat += ":00";
      }
    } else if (["1d"].indexOf(this.cfg.timeUnit) !== -1) {
      if ([1, 2, 3].indexOf(base.getDate()) !== -1) {
        dateFormat = months[base.getMonth()];
      } else {
        dateFormat = base.getDate();
      }
      // dateFormat += " " + base.getHours();
    } else if (["1w"].indexOf(this.cfg.timeUnit) !== -1) {
      if ([1, 2, 3, 4, 5].indexOf(base.getDate()) !== -1) {
        dateFormat = months[base.getMonth()];
      } else {
        dateFormat = base.getDate();
      }
    }
    //convert to string
    return dateFormat + "";
  };

  // return one period unit(milisecconds) for current period
  Lines.prototype.dateUnit = function() {
    var oneMin, unit;

    oneMin = 60000; //60

    switch (this.cfg.timeUnit) {
      case "5m":
        unit = 5 * oneMin;
        break;
      case "15m":
        unit = 15 * oneMin;
        break;
      case "30m":
        unit = 30 * oneMin;
        break;
      case "1h":
        unit = 60 * oneMin;
        break;
      case "4h":
        unit = 4 * 60 * oneMin;
        break;
      case "1d":
        unit = 24 * 60 * oneMin;
        break;
      case "1w":
        unit = 7 * 24 * 60 * oneMin;
        break;
    }

    return unit;
  };

  //calculate hours;
  //in minute
  //start date
  //start hour
  Lines.prototype.labelX = function(step) {
    var label, res = "";
    label = 840; //14 why 14 ???
    switch (this.cfg.timeUnit) {
      case "5m":
        label += 5 * step;
        break;
      case "15m":
        label += 15 * step;
        break;
      case "30m":
        label += 30 * step;
        break;
      case "1h":
        label += 60 * step;
        break;
      case "4h":
        label += 4 * 60 * step;
        break;
      case "1d":
        label += 24 * 60 * step;
        break;
      case "1w":
        label += 7 * 24 * 60 * step;
        break;
    }

    //days
    if (label / 1440 > 1) {
      res += Math.floor(label / 1440) + "days ";
      label = label % 1440;
    }

    res += Math.floor(label / 60) + (label % 60) / 100;
    return res;
  };

  //////////////////////////////////// DRAW FUNCTIONS >>>
  // add snap.path to store
  Lines.prototype.drawLine = function() {
    var points, plen, pkey = 0,
      _linePath = "",
      lineAxis = [];

    if (this.checkId({ type: this.TYPE.line })) {
      this.pr("Line chart already exist");
      return;
    }

    points = this.gg("points");
    plen = points.length - 1;

    for (; pkey < plen; pkey++) {
      lineAxis.push([points[pkey][0], points[pkey][1]]); // x1, y1
      lineAxis.push([points[pkey + 1][0], points[pkey + 1][1]]); // x2, y2
      _linePath += this.getPath(lineAxis);
      this.drawDebug(lineAxis[0]);
      lineAxis = [];
    }

    this.drawDebug(points[plen]); //last dot
    this.printPath({ type: this.TYPE.line, path: _linePath });
  };

  //Material 400 
  Lines.prototype.getHex = function() {
    var colors = ["#ef5350", "#ec407a", "#ab47bc", "#7e57c2", "#5c6bc0", "#42a5f5", "#26a69a", "#66bb6a", "#9ccc65"];
    colors = colors.concat(["#c62828", "#ad1457", "#6a1b9a", "#4527a0", "#1565c0", "#2e7d32", "#558b2f"]);

    return colors[Math.floor(Math.random() * colors.length)];
  };

  // animate or not
  // https://codepen.io/JRGould/pen/dkHhw
  Lines.prototype.printPath = function(lineProp) {
    if (this.cfg.animate) {
      this.animatePath(lineProp, () => {
        if (this.drawOrder[0]) {
          var callFunc = this.drawOrder.shift();
          this[callFunc]();
        }
      });
    } else {
      this.directPath(lineProp);
    }
  };

  // only sma & ema charts can be draw more than once
  Lines.prototype.exist = function(chartType) {
    if ([this.TYPE.sma, this.TYPE.ema].indexOf(chartType) === -1) {
      return false;
    }

    return !!this.elms[chartType];
  };

  Lines.prototype.directPath = function(lineProp) {
    var svg, svgAttr = {},
      elemID, color, storedColor = {};

    svg = this.snap.path(lineProp.path);
    svgAttr.class = lineProp.class || this.cfg.cssClass[lineProp.type];
    svg.attr(svgAttr);

    // handle repeating sma & ema charts 5 -- 20 -- 50
    if (this.exist(lineProp.type)) {
      elemID = this.makeId(lineProp);
      if (this.g({ type: this.TYPE.sinit, prop: "color" })) {
        color = this.g({ type: this.TYPE.sinit, prop: "color" })[elemID];
      } else {
        color = this.getHex();
      }

      svg.attr({ style: "stroke: " + color });
      this.store({ type: lineProp.type, length: lineProp.length, prop: "color" }, color);
      storedColor[elemID] = color;
      this.s({ type: this.TYPE.sinit, prop: "color" }, storedColor);
      this.drawLegend();
    }

    // axis & candle NEED group
    // if ([this.TYPE.axis, this.TYPE.candle].indexOf(lineProp.type) !== -1) {
    if (lineProp.type !== this.TYPE.axis && lineProp.type !== this.TYPE.candle) {
      lineProp.single = true;
    }

    this.store(lineProp, svg);
  };

  //lineProp = {type; path; color; width; strokeDasharray}
  // toDo - remove animation as it is now
  // replace it with draw White chart and animate after that
  // imidiatly set all chart properties
  Lines.prototype.animatePath = function(lineProp, cbNext) {
    var svg, lineLen, svgAttr = {};

    svgAttr.class = lineProp.class || this.cfg.cssClass[lineProp.type];
    svg = this.snap.path(svgAttr);

    lineLen = Snap.path.getTotalLength(lineProp.path);
    /* beautify preserve:start */
    Snap.animate(0, lineLen, step => {
      svg.attr({
        path: Snap.path.getSubpath(lineProp.path, 0, step),
        strokeWidth: lineProp.width || 1
      });
    },
    800, //duration
    mina.backOut,
    () => {
      if (this.exist(lineProp.type)) {
        var color = this.getHex();
        svg.attr({ style: "stroke: " + color });
        this.store({ type: lineProp.type, length: lineProp.length, prop: "color" }, color);
        this.drawLegend();
      }
      //store single or group
      if ([this.TYPE.axis, this.TYPE.candle].indexOf(lineProp.type) !== -1) {
        this.store({ type: lineProp.type, length: lineProp.length }, svg);
      } else {
        this.store({ type: lineProp.type, length: lineProp.length, single: true }, svg);
      }
      cbNext && cbNext();
    });
    /* beautify preserve:end */
  };

  Lines.prototype.getPath = function(lineAxis) {
    if (lineAxis.length !== 2) {
      return;
    }
    var path = "M" + Math.floor(lineAxis[0][0]) + " " + Math.floor(lineAxis[0][1]);
    path += "L" + Math.floor(lineAxis[1][0]) + " " + Math.floor(lineAxis[1][1]);

    return path;
  };

  // start with 
  // 1. drawCandle
  // 2. candle
  // 3. candleShadow
  Lines.prototype.drawCandle = function() {
    var width, raw, rkey;

    if (this.checkId({ type: this.TYPE.candle })) {
      this.pr("Candle chart already exist");
      return;
    }

    width = this.gg("stepX") * this.cfg.chart.candleFill;
    this.s({ type: this.TYPE.candle, prop: "width" }, this.f(width, 0));

    raw = this.gg("raw");
    for (rkey in raw) {
      (key => {
        var cdata = {
          open: raw[key][0],
          high: raw[key][1],
          low: raw[key][2],
          close: raw[key][3],
        };

        (key > 0) && this.candle(cdata, key);
      })(rkey);
    }
  };

  Lines.prototype.candle = function(candleData, period) {
    var axis = [],
      candle = {};

    axis[0] = this.gg("points")[period - 1];
    axis[1] = this.gg("points")[period];

    candle.data = candleData;
    candle.height = this.f(axis[0][1] - axis[1][1], 0);
    candle.width = this.g({ type: this.TYPE.candle, prop: "width" });

    candle.x = axis[0][0] + ((1 - this.cfg.chart.candleFill) / 2 * this.gg("stepX"));
    candle.x = this.f(candle.x, 0);
    candle.x -= this.gg("stepX"); //invert chart fix
    if (axis[0][1] > axis[1][1]) {
      candle.class = this.cfg.cssClass.loseCandle;
      candle.y = axis[1][1];
    } else {
      candle.class = this.cfg.cssClass.winCandle;
      candle.y = axis[0][1];
    }

    candle.info = {
      type: this.TYPESVG.rect,
      axis: [candle.x, candle.y],
      w: candle.width,
      h: candle.height,
      class: candle.class
    };
    candle.element = this.drawSVG(candle.info);
    this.store({ type: this.TYPE.candle }, candle.element);
    this.candleShadow(candle, period);
  };

  /* candleShadow - top & bottom
   * 
   * @param {type} candle {data:{open, high, low, close}, width, height, x, y}
   * @param {type} color string
   */
  Lines.prototype.candleShadow = function(candle, period) {
    var axisX, lineTop, lineBot, _linePath = "";
    /* beautify preserve:start */
    lineTop = lineBot = [[], []];
    /* beautify preserve:end */

    axisX = candle.x + this.f((candle.width / 2), 0);
    lineTop[0] = [axisX, candle.y];
    lineTop[1][0] = axisX;
    lineTop[1][1] = (candle.data.high - candle.data.close) * this.gg("stepY");
    lineTop[1][1] = lineTop[0][1] - lineTop[1][1];
    _linePath += this.getPath(lineTop);

    lineBot[0][0] = axisX;
    lineBot[0][1] = lineTop[0][1] + candle.height;
    lineBot[1][0] = axisX;
    lineBot[1][1] = lineBot[0][1] + this.f(((candle.data.close - candle.data.low) * this.gg("stepY")), 0);
    _linePath += this.getPath(lineBot);

    //store linePath into array make ALL candle shadows with only TWO DOM elements
    if (candle.class === this.cfg.cssClass.winCandle) {
      this.add({ type: this.TYPE.candle, prop: "winp" }, _linePath);
    } else {
      this.add({ type: this.TYPE.candle, prop: "losep" }, _linePath);
    }
    if (parseInt(period) + 1 === this.gg("data").length) {
      let shadowPath;
      shadowPath = this.g({ type: this.TYPE.candle, prop: "winp" });
      this.printPath({ type: this.TYPE.candle, path: shadowPath.join(" "), class: this.cfg.cssClass.winCandle });
      shadowPath = this.g({ type: this.TYPE.candle, prop: "losep" });
      this.printPath({ type: this.TYPE.candle, path: shadowPath.join(" "), class: this.cfg.cssClass.loseCandle });
    }
  };

  // a0+a1+ ....a9 / 10 = sma9
  // a1+a2+ ....a10 / 10 = sma10
  Lines.prototype.calcSMA = function(smaLength) {
    var data, dLen, len, total = 0,
      dKey = 0;

    data = this.gg("data");

    //calc missing part of SMA
    if (this.g({ type: this.TYPE.sinit, prop: "allraw" })) {
      var bdata = this.g({ type: this.TYPE.sinit, prop: "allraw" });
      var slice = this.g({ type: this.TYPE.sinit, prop: "slice" });
      bdata = bdata.slice(slice.begin - smaLength, slice.begin);
      bdata = bdata.map(v => v[3]);
      data = bdata.concat(data); //merge bdata & data
    }

    dLen = data.length;

    //sma period length by configuration
    len = smaLength || this.cfg.smaLength - 1;

    for (; dKey < dLen; dKey++) {
      total += data[dKey];

      if (dKey >= len) {
        if (dKey > len) {
          total -= data[(dKey - (len + 1))];
        }
        this.add({ type: this.TYPE.sma, prop: "data" + len }, this.f(total / (len + 1)));
      }
    }

    this.initSMA(len);
  };

  //define lastX & lastY for default SMA
  Lines.prototype.initSMA = function(smaLength) {
    var data, key = 1,
      len, lastAxis = [];

    data = this.g({ type: this.TYPE.sma, prop: "data" + smaLength });
    if (this.g({ type: this.TYPE.sinit, prop: "allraw" })) {
      lastAxis[0] = this.gg("zeroX");
    } else {
      lastAxis[0] = this.gg("zeroX") + (smaLength * this.gg("stepX"));
      lastAxis[0] = this.f(lastAxis[0], 0);
    }

    this.s({ type: this.TYPE.sma, prop: "lastX" + smaLength }, lastAxis[0]);

    lastAxis[1] = this.chartArea.zeroY - ((data[0] - this.gg("min")) * this.gg("stepY")); //???
    lastAxis[1] = this.f(lastAxis[1], 0);
    this.s({ type: this.TYPE.sma, prop: "lastY" + smaLength }, lastAxis[1]);

    this.s({ type: this.TYPE.sma, prop: "points" + smaLength }, []); // clear
    this.add({ type: this.TYPE.sma, prop: "points" + smaLength }, lastAxis); // point 0
    len = data.length;
    for (; key < len; key++) {
      (this.calcPoint)(key, this.TYPE.sma, smaLength);
    }
  };

  Lines.prototype.drawSMA = function(smaLength) {
    var points, plen, key = 0,
      lineAxis = [],
      _linePath = "";

    smaLength = smaLength || this.cfg.smaLength;
    points = this.g({ type: this.TYPE.sma, prop: "points" + smaLength });

    if (this.gg("data").length < smaLength) {
      return;
    } else if (this.checkId({ type: this.TYPE.sma, length: smaLength })) {
      this.pr("SMA chart already exist");
      return;
    }

    points && (plen = points.length);
    if (!plen) {
      this.calcSMA(smaLength);
      this.drawSMA(smaLength);
      return;
    } else if (plen < smaLength && 1 === 2) {
      this.pr("SMA can NOT exist insufficient points");
      return;
    }

    for (; key < (plen - 1); key++) {
      lineAxis.push([points[key][0], points[key][1]]);
      lineAxis.push([points[key + 1][0], points[key + 1][1]]);

      _linePath += this.getPath(lineAxis);

      this.drawDebug(lineAxis[0]);
      lineAxis = [];
    }

    this.drawDebug(lineAxis[plen]);
    this.printPath({ type: this.TYPE.sma, path: _linePath, length: smaLength });
  };

  // EMA(today) = Price(today) * K + EMA(yesterday) * (1-K)
  // EMAtoday = Ptoday * k + EMAyest * k2
  // K = 2 / (length + 1)
  Lines.prototype.calcEMA = function(emaLength) {
    var emaK, emaK2, ema = { price: 0, today: 0, yest: 0 };
    var data, key = 1,
      len;

    emaK = 2 / (emaLength + 1);
    this.s({ type: this.TYPE.ema, prop: "k" + emaLength }, this.f(emaK, 5));
    emaK2 = 1 - emaK;

    this.s({ type: this.TYPE.ema, prop: "lastX" + emaLength }, this.gg("zeroX"));
    this.s({ type: this.TYPE.ema, prop: "lastY" + emaLength }, this.gg("zeroY"));

    this.s({ type: this.TYPE.ema, prop: "data" + emaLength }, []);
    this.add({ type: this.TYPE.ema, prop: "data" + emaLength }, this.gg("data")[0]);

    data = this.gg("data");
    len = data.length;
    for (; key < len; key++) {
      ema.price = data[key];
      ema.yest = this.g({ type: this.TYPE.ema, prop: "data" + emaLength })[key - 1];
      ema.today = ema.price * emaK + ema.yest * emaK2;

      this.add({ type: this.TYPE.ema, prop: "data" + emaLength }, this.f(ema.today, 5));
    }

    len = key;
    key = 1;
    for (; key < len; key++) {
      (this.calcPoint)(key, this.TYPE.ema, emaLength);
    }
  };

  //Exponential Mobing Average
  Lines.prototype.drawEMA = function(emaLength) {
    var points, plen, key = 0,
      lineAxis = [],
      _linePath = "";

    emaLength = emaLength || this.cfg.emaLength;
    points = this.g({ type: this.TYPE.ema, prop: "points" + emaLength });

    points && (plen = points.length);
    if (!plen) {
      this.calcEMA(emaLength);
      this.drawEMA(emaLength);
      return;
    } else if (plen < this.cfg.emaLength) {
      this.pr("EMA can NOT exist insufficient points");
      return;
    }

    for (; key < (plen - 1); key++) {
      lineAxis.push([points[key][0], points[key][1]]);
      lineAxis.push([points[key + 1][0], points[key + 1][1]]);

      _linePath += this.getPath(lineAxis);

      this.drawDebug(lineAxis[0]);
      lineAxis = [];
    }

    this.printPath({ type: this.TYPE.ema, path: _linePath, length: emaLength });
  };


  Lines.prototype.liveFlag = false;
  Lines.prototype.dragX = 0;

  //turn on live dot which follow user mouse 
  Lines.prototype.live = function() {
    var live = {},
      self = this,
      dot, label, left, dragX;

    if (this.cfg.animate && !this.liveFlag) {
      this.liveFlag = true;
      this.drawOrder.push("live");
      return;
    }
    if (!this.findY(100)) return;

    live.labelInfo = {
      type: this.TYPESVG.text,
      axis: [this.chartArea.zeroX, this.chartArea.zeroY],
      text: "",
      class: this.cfg.cssClass.liveLabel
    };
    label = this.drawSVG(live.labelInfo);

    live.dotInfo = {
      type: this.TYPESVG.circle,
      axis: [100, this.findY(100).pixel],
      r: this.cfg.debug.radius,
      class: this.cfg.cssClass.liveDot
    };
    dot = this.drawSVG(live.dotInfo);

    left = this.chartArea.offsetLeft;
    this.snap.mousemove((e, x) => {
      var cx, foundY;
      x -= left;
      if (x < this.chartArea.zeroX && !(x % 5)) {
        cx = x + this.dragX;
        foundY = this.findY((x - this.dragX)) || 0;
        if (foundY.pixel) {
          dot.attr({
            "cx": x,
            "cy": foundY.pixel
          });
          label.node.innerHTML = foundY.value;
          label.attr({ y: foundY.pixel });
        }
      }
    });

    // if (!this.lcGroup) {
    //   this.lcGroup = this.snap.g(this.elms.line["svg-line"].elem);
    // }

    // this.snap.drag((moveX, moveY) => {
    //   dragX = moveX;

    //   self.lcGroup.attr({ transform: "t" + (dragX + self.dragX) });
    // }, () => {}, () => {
    //   self.dragX += dragX;
    // });
  };

  // http://jsfiddle.net/tM4L9/7/
  // mobile support
  // option {constx, consty, arrow, tube}

  // use for live draw
  // CLICK > MOUSEMOVE callback(state)
  // !!! handle ONLY mouseMove mouseClick and return moveAxis
  // for reference see navDot function
  // cb({state: start}) first click
  // cb({state: move}) before second click
  // cb({state: finish}) second click
  // reduse complexity into liveLine
  // - one from mousemove and one mouseclick
  Lines.prototype.liveMove = function(liveInfo = {}, cb) {
    var self = this,
      clicks = 0,
      offset = {},
      axis = [],
      magnet = {};

    offset.left = this.chartArea.offsetLeft;
    offset.top = this.chartArea.offsetTop;

    this.snap.unclick();
    this.snap.click((e, clickX, clickY) => {
      this.setEvent("draw", true);
      axis[0] = [(clickX - offset.left), (clickY - offset.top)];
      axis[1] = [(axis[0][0] + this.cfg.chart.padding), (axis[0][1] + this.cfg.chart.padding)];

      (!clicks && cb) && cb({ state: "start", axis: axis });
      clicks++;

      if (clicks === 1) {
        this.snap.unmousemove(); //bind once
        this.snap.mousemove(function(e, dx, dy) {
          if (((dx % 5) && (dy % 5)) || (axis[1][0] > self.chartArea.width)) {
            return;
          }

          var _axis = axis.slice(0); //deep copy 
          _axis[1] = [(dx - offset.left), (dy - offset.top)];
          magnet = self.findY(_axis[1][0]); //return pixel, value
          magnet.diff = Math.abs(_axis[1][1] - magnet.pixel);
          if (self.cfg.magnetMode && magnet.diff < self.cfg.magnetMode) {
            _axis[1][1] = magnet.pixel;
          }

          if (liveInfo.constx) {
            _axis[0][0] = self.chartArea.endX;
            _axis[1][0] = self.chartArea.width; // axisX2
            _axis[0][1] = _axis[1][1]; // axisY1
          } else if (liveInfo.consty) {
            _axis[0][1] = self.cfg.chart.padding;
            _axis[1][1] = self.chartArea.height + self.cfg.chart.padding; // axisY
            _axis[0][0] = _axis[1][0]; // axisX
          }
          //axis > mouse axis, axis is with manipulation
          cb && cb({ state: "move", axis: _axis });
        });
      } else if (clicks === 2) {
        this.setEvent("draw", false);
        this.snap.unclick();
        this.snap.unmousemove();
        cb && cb({ state: "finish", axis: axis });
      }
    });
  };

  // delete from id or navid
  // delete from live element object(lelms)
  Lines.prototype.dl = function(deleteInfo = {}) {
    var delIndex;
    if (deleteInfo.type === "nav" && this.lelms.navid.indexOf(deleteInfo.prop) !== -1) {
      delIndex = this.lelms.navid.indexOf(deleteInfo.prop);
      this.lelms.navid.splice(delIndex, 1);
    } else if (this.lelms.id.indexOf(deleteInfo.prop) !== -1) {
      delIndex = this.lelms.id.indexOf(deleteInfo.prop);
      this.lelms.id.splice(delIndex, 1);
    }

    if (deleteInfo.prop && this.lelms[deleteInfo.type][deleteInfo.prop]) {
      delete this.lelms[deleteInfo.type][deleteInfo.prop];
    } else {
      delete this.lelms[deleteInfo.type];
    }
  };

  //get live property
  // start to use lelms
  // should replace lgs

  // this.lgs("navs").length;
  // get live
  Lines.prototype.gl = function(getInfo = {}) {
    if (getInfo.id) {
      var elemInfo = this.splitId(getInfo.id, true);
      return this.lelms[elemInfo.type][getInfo.id];
    } else if (getInfo.prop) {
      return this.lelms[getInfo.type] ? (this.lelms[getInfo.type][getInfo.prop] || false) : false;
    } else {
      return this.lelms[getInfo.type] || false;
    }
  };

  // set live
  Lines.prototype.sl = function(setInfo = {}, setData) {
    this.lelms[setInfo.type] || (this.lelms[setInfo.type] = {});
    //push elemID into navid OR id
    if (setInfo.type === "nav") {
      this.lelms.navid.push(setInfo.prop);
    } else {
      this.lelms.id.push(setInfo.prop);
    }

    this.lelms[setInfo.type][setInfo.prop] = setData;
  };


  Lines.prototype.dragtmp = {
    elem: "",
    move: "",
    rotate: ""
  };

  //toggle global Events
  // - wheel
  // - drag
  Lines.prototype.setEvent = function(eventType = false, eventState) {
    if (!eventType || typeof eventState !== "boolean") {
      return;
    } else if (["drag", "draw"].indexOf(eventType) === -1) {
      return;
    }

    this.sl({ type: "action", prop: eventType }, eventState);
  };

  // set lelms.last.elem and use for further on
  // callback function for drag navigation DOT...
  // dragData.state = [start, drag, finish]
  Lines.prototype.navDotDrag = function(dragData = {}, extraData = {}) {
    //explicit set new element for EACH DRAG START !!!
    if (dragData.state === "start") {
      this.setEvent("drag", true);
      this.dragtmp.elem = this.gl({ id: dragData.elemId });
      this.dragtmp.move = this.getNavDot(dragData.elemId, "move");
      this.dragtmp.rotate = this.getNavDot(dragData.elemId, "rotate");
      this.dragtmp.moveAxis = this.getAxis(dragData.elemId, "move");

      if (!this.dragtmp.group) {
        this.dragtmp.elem.transform("");
        this.dragtmp.group = this.snap.g(this.dragtmp.elem);
        this.dragtmp.group.transform(this.dragtmp.transform);
        if (extraData.arrow) {
          this.dragtmp.group.add(this.getByType(dragData.elemId, "arrow"));
        } else if (extraData.tube) {
          var tubeElem = this.getByType(dragData.elemId, "tube");
          this.dragtmp.group.add(tubeElem.top, tubeElem.bot);
        }
      }

      if (dragData.action === "move") {
        this.dragtmp.rotate.transform("");
        // this.dragtmp.group = this.snap.g(this.dragtmp.elem, this.dragtmp.rotate);
        this.dragtmp.group.add(this.dragtmp.rotate);
        // this.dragtmp.group.add(this.dragtmp.arrow);
      }
      this.dragtmp.transform = this.dragtmp.group.transform ? this.dragtmp.group.transform().local : 0;
    } else if (dragData.state === "drag") {
      var transform;
      if (dragData.action === "move") {
        transform = this.dragtmp.transform + (this.dragtmp.transform ? "T" : "t");
        transform += [dragData.dx, dragData.dy];
        this.dragtmp.group.transform(transform);
      } else if (dragData.action === "rotate") {
        transform = this.dragtmp.transform + (this.dragtmp.transform ? "R" : "r");
        transform += [dragData.angle, this.dragtmp.moveAxis.x, this.dragtmp.moveAxis.y];
        this.dragtmp.group.transform(transform);
      }
    } else if (dragData.state === "finish" && dragData.action === "move") {
      // this.mvElem(dragData.elemId);
      this.mvElem(this.dragtmp.rotate.node.id);
      this.setEvent("drag", false);
    }
  };

  //toDo - change live elements object
  // quite heavy method !!! BE CAREFUL
  // liveMove !!!
  // navDotDrag !!!
  Lines.prototype.liveLine = function(extra = {}) {
    var axis, elemID, navidLength, liveLine = {};
    //restore last live element for multiple lines ...
    this.lelms.last = 0;
    this.liveMove(extra, moveData => {
      axis = moveData.axis;

      if (extra.text) {
        this.liveText(moveData);
      } else if (moveData.state === "start") {
        navidLength = (this.gl({ type: "navid" }) || []).length;
        elemID = this.makeId({ type: "line", nav1: navidLength, nav2: navidLength + 1 }, true);
        liveLine.info = {
          type: this.TYPESVG.line,
          axis: axis,
          class: this.cfg.cssClass.liveLine,
          id: elemID
        };
        this.lelms.last = this.drawSVG(liveLine.info);
        this.sl({ type: "line", prop: elemID }, this.lelms.last); //set/store element

        // add navigation DOT at start of MOVE
        if (!extra.tube) {
          this.navDot({ axis: axis[0], action: "move", elemId: elemID, extra: extra },
            dragData => this.navDotDrag.call(this, dragData, extra));

          this.navDot({ axis: axis[1], action: "rotate", elemId: elemID, extra: extra },
            dragData => this.navDotDrag.call(this, dragData, extra));
        }
        // extra.arrow && this.liveArrow([axis[1]]);
        // extra.tube && this.liveTube([axis[1]]);
      } else if (moveData.state === "move") {
        this.lelms.last.attr({
          x1: axis[0][0],
          y1: axis[0][1],
          x2: axis[1][0],
          y2: axis[1][1]
        });
        if (!extra.tube) {
          var ndots = this.getNavDot(elemID);
          ndots.move.attr({ cx: moveData.axis[1][0], cy: moveData.axis[1][1] });
          ndots.rotate.attr({ cx: moveData.axis[0][0], cy: moveData.axis[0][1] });
        }

        extra.arrow && this.liveArrow([axis[1], axis[0]]);
        extra.tube && this.liveTube([axis[1], axis[0]]);
      } else if (moveData.state === "finish") {
        this.lelms.last.click(() => this.liveLineClick.call(this, elemID));
        this.lelms.last.dblclick(() => this.liveLineDblclick.call(this, elemID));
      }
    });
  };

  //add input type=text
  // toDo create it with contenteditable and 
  // svg.text > tspan multi lines
  Lines.prototype.liveText = function(moveData) {
    var txtSvg = {};

    txtSvg.rectId = this.makeId({ type: "rect" }, true);
    txtSvg.textId = this.makeId({ type: "text" }, true);
    txtSvg.elem1 = this.gl({ type: "rect", prop: txtSvg.rectId });
    txtSvg.elem2 = this.gl({ type: "text", prop: txtSvg.textId });
    if (!txtSvg.elem1) {
      txtSvg.rectInfo = {
        type: this.TYPESVG.rect,
        axis: moveData.axis[0],
        w: 200,
        h: 25,
        id: txtSvg.rectId,
        attr: { fill: "white" }
      };
      txtSvg.rect = this.drawSVG(txtSvg.rectInfo);
      this.sl({ type: "rect", prop: txtSvg.rectId }, txtSvg.rect);
      txtSvg.textInfo = {
        type: this.TYPESVG.text,
        axis: [moveData.axis[0][0] + 30, moveData.axis[0][1] + 15],
        id: txtSvg.textId,
        class: "tlabel",
        text: "Your comment"
      };
      txtSvg.text = this.drawSVG(txtSvg.textInfo);
      this.sl({ type: "text", prop: txtSvg.textId }, txtSvg.text);
    } else {
      this.moveElem(txtSvg.elem1, moveData.axis[1]);
      this.moveElem(txtSvg.elem2, moveData.axis[1].map(val => val + 20));
    }

    if (moveData.state === "finish") {
      this.moveElem(txtSvg.elem1, moveData.axis[0]);
      this.moveElem(txtSvg.elem2, moveData.axis[0].map(val => val + 20));

      txtSvg.elem1.click((ev, cx, cy) => this.liveTextClick.call(this, moveData.axis, txtSvg.textId));
      txtSvg.elem2.click((ev, cx, cy) => this.liveTextClick.call(this, moveData.axis, txtSvg.textId));
    }
  };

  // handle click on text
  Lines.prototype.liveTextClick = function(axis, textAreaId) {
    var self = this,
      textId, inputStyle, delInput;

    textId = textAreaId || this.makeId({ type: "text" }, true);
    var txt = this.gl({ type: this.TYPESVG.text, prop: textId });

    var inputElem = document.createElement("textarea");
    // inputElem.type = "text";
    inputStyle = "position: absolute;";
    inputStyle += "left: " + (axis[0][0] + 7) + "px;";
    inputStyle += "top: " + (axis[0][1] + 7) + "px;";
    inputElem.id = this.makeId({ type: this.TYPESVG.input }, true);
    inputElem.style.cssText = inputStyle;
    inputElem.class = "tlabel";
    inputElem.addEventListener("input", function() {
      self.gl({ type: self.TYPESVG.text, prop: textId })
        .attr({ text: this.value });
    }, false);
    if (txt.node.innerHTML === "Your comment") {
      inputElem.placeholder = txt.node.innerHTML;
    } else {
      inputElem.value = txt.node.innerHTML;
    }

    this.el.parentElement.appendChild(inputElem);
    inputElem.focus();
    setTimeout(function() {
      self.el.addEventListener("click", delInput);
    }, 0);

    delInput = function() {
      document.getElementById(inputElem.id).remove();
      self.el.removeEventListener("click", delInput, false);
    };
  };

  Lines.prototype.moveElem = function(elem, axis) {
    elem.attr({
      x: axis[0],
      y: axis[1]
    });
  };

  // Toggle hidden class for line's navDots
  Lines.prototype.liveLineClick = function(liveLineID) {
    var navDots;
    navDots = this.getNavDot(liveLineID); // return move & rotate
    navDots.classMove = navDots.move ? navDots.move.attr("class").split(" ") : [];
    navDots.classRotate = navDots.rotate ? navDots.rotate.attr("class").split(" ") : [];

    if (navDots.classMove.indexOf("hidden") !== -1) {
      navDots.classMove.pop(); //remove last element from array
      navDots.classRotate.pop();
    } else {
      navDots.classMove.push("hidden");
      navDots.classRotate.push("hidden");
    }

    navDots.move && navDots.move.attr({ class: navDots.classMove.join(" ") });
    navDots.rotate && navDots.rotate.attr({ class: navDots.classRotate.join(" ") });

    this.dragtmp = {};
  };

  // REMOVE liveLineID and related navDots
  Lines.prototype.liveLineDblclick = function(liveLineID) {
    var navDots;
    navDots = this.getNavDot(liveLineID);
    navDots.move.remove();
    navDots.rotate.remove();
    this.gl({ type: "line", prop: liveLineID }).remove();
    //delete from live element storage(lelms)
    this.dl({ type: "line", prop: liveLineID });
    this.dl({ type: "nav", prop: navDots.move.node.id });
    this.dl({ type: "nav", prop: navDots.rotate.node.id });
  };

  // return arrow for liveElemID
  // return tube bot & top
  Lines.prototype.getByType = function(liveElemID, typeElem = "arrow") {
    var elemInfo, liveElem = {};
    elemInfo = this.splitId(liveElemID);
    if (typeElem === "arrow") {
      liveElem.id = this.makeId({ type: typeElem, nav1: elemInfo.navdot[1] }, true);
      liveElem.elem = this.gl({ type: typeElem, prop: liveElem.id });
    } else if (typeElem === "tube") {
      liveElem.id1 = this.makeId({ type: typeElem, nav1: elemInfo.navdot[0] }, true);
      liveElem.id2 = this.makeId({ type: typeElem, nav1: elemInfo.navdot[1] }, true);
      liveElem.elem = {};
      liveElem.elem.top = this.gl({ type: typeElem, prop: liveElem.id1 });
      liveElem.elem.bot = this.gl({ type: typeElem, prop: liveElem.id2 });
    }

    return liveElem.elem;
  };

  //draw arrow ONLY from lineAxis[0]
  Lines.prototype.liveArrow = function(lineAxis) {
    var points = [],
      size, angle = 0,
      apath = "",
      arrow = {};

    arrow.id = this.makeId({ type: "arrow" }, true);
    size = this.cfg.step.arrow / 5;
    points.push([lineAxis[0][0] - size, lineAxis[0][1] + size]);
    points.push([lineAxis[0][0] + size, lineAxis[0][1] + size]);
    points.push(lineAxis[0]); //joint point
    apath += this.getPath([points[0], points[2]]);
    apath += this.getPath([points[1], points[2]]);

    arrow.elem = this.gl({ type: "arrow", prop: arrow.id });
    if (arrow.elem) {
      if (lineAxis[1]) {
        angle = Snap.angle(lineAxis[0][0], lineAxis[0][1], lineAxis[1][0], lineAxis[1][1]);
        angle = this.f(angle, 0) + 90;
      }
      arrow.elem.attr({ d: apath });
      arrow.elem.transform("r" + angle + "," + lineAxis[0][0] + "," + lineAxis[0][1]);
    } else {
      arrow.elem = this.snap.path(apath);
      arrow.elem.attr({ class: this.cfg.cssClass.liveLine });
      arrow.elem.node.id = arrow.id;
      this.sl({ type: "arrow", prop: arrow.id }, arrow.elem);
    }
  };

  Lines.prototype.liveTube = function(lineAxis = []) {
    var liveElemID, pts = [],
      tlines = {};

    if (!lineAxis[1]) {
      return;
    }
    pts[0] = [lineAxis[1][0], lineAxis[1][1]];
    pts[1] = [lineAxis[1][0] + (this.chartArea.width - lineAxis[1][0]), lineAxis[1][1]];
    pts[2] = [lineAxis[0][0], lineAxis[0][1]];
    pts[3] = [lineAxis[0][0] + (this.chartArea.width - lineAxis[0][0]), lineAxis[0][1]];

    tlines.angle = Snap.angle(lineAxis[0][0], lineAxis[0][1], lineAxis[1][0], lineAxis[1][1]);
    liveElemID = this.lelms.last.node.id;

    if (!this.getByType(liveElemID, "tube").top || !this.getByType(liveElemID, "tube").bot) {
      var navidLength = (this.gl({ type: "navid" }) || []).length;
      navidLength = !navidLength ? 1 : navidLength;
      // TOP LINE
      tlines.topID = this.makeId({ type: "tube", nav1: navidLength }, true);
      tlines.top = this.snap.line(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
      tlines.top.attr({ class: this.cfg.cssClass.liveLine, id: tlines.topID });
      // BOT LINE
      tlines.botID = this.makeId({ type: "tube", nav1: navidLength - 1 }, true);
      tlines.bot = this.snap.line(pts[2][0], pts[2][1], pts[3][0], pts[3][1]);
      tlines.bot.attr({ class: this.cfg.cssClass.liveLine, id: tlines.botID });
      this.sl({ type: "tube", prop: tlines.topID }, tlines.top);
      this.sl({ type: "tube", prop: tlines.botID }, tlines.bot);

      tlines.moveAxis = [pts[0][0] + this.cfg.chart.navDot, pts[0][1] + this.cfg.chart.navDot];
      this.navDot({ axis: tlines.moveAxis, action: "move", elemId: liveElemID },
        dragData => this.navDotDrag.call(this, dragData, { tube: true }));

      tlines.rotateAxis = [pts[2][0] + this.cfg.chart.navDot, pts[2][1] + this.cfg.chart.navDot];
      this.navDot({ axis: tlines.rotateAxis, action: "rotate", elemId: liveElemID },
        dragData => this.navDotDrag.call(this, dragData, { tube: true }));
    } else {
      tlines.angle -= 90;

      if (!this.updateOnce) {
        this.getByType(liveElemID, "tube").top.attr({ x1: pts[0][0], x2: pts[1][0], y1: pts[0][1], y2: pts[1][1] });
        this.getNavDot(liveElemID, "rotate").attr({ cx: lineAxis[1][0], cy: lineAxis[1][1] });
        this.updateOnce = true;
      }
      this.getByType(liveElemID, "tube").top.transform("r" + tlines.angle + "," + [pts[0][0], pts[0][1]]);
      this.getByType(liveElemID, "tube").bot.attr({ x1: pts[2][0], y1: pts[2][1], y2: pts[3][1] });
      this.getByType(liveElemID, "tube").bot.transform("r" + tlines.angle + "," + [pts[2][0], pts[2][1]]);
      this.getNavDot(liveElemID, "move").attr({ cx: pts[2][0], cy: pts[2][1] });
    }
  };


  /**
   * navDot Method.
   * @desc Draw navDot and attach drag to the element
   * @desc encapsulate navDot drag inside in the method
   * - There are two types of navDot: move & rotate
   * - Rotation navDot need to be second one, because it depend on axis of the first
   * - We use move.navDot AXIS for center of rotation
   * - Also need to know the angle between navDot1 & navDot2 for proper Rotation
   *
   * @param {object} navData - The difference from previous point data.
   * @param {function} cb - Callback({state: start || drag || finish}) state from drag
   *
   *  FIRST navDot - MOVE
   *  SECOND navDot - ROTATE
   *  toDo - add RESIZE navDot or use some of exist ones
   */
  Lines.prototype.navDot = function(navData = {}, cb) {
    var navDot = {},
      navRotate, initAngle, chart = {},
      self = this;

    navDot.count = (this.gl({ type: "navid" }) || []).length; //

    navDot.info = {
      type: this.TYPESVG.circle,
      axis: [navData.axis[0] - this.cfg.chart.navDot, navData.axis[1] - this.cfg.chart.navDot],
      r: this.cfg.chart.navDot,
      id: this.makeId({ type: "nav", nav1: navDot.count }, true)
    };
    navDot.elem = this.drawSVG(navDot.info);

    if (navDot.count % 2 === 0) {
      navDot.elem.attr({ class: this.cfg.cssClass.navDot + " " + this.cfg.cssClass.moveNavDot + " hidden" });
    } else {
      navDot.elem.attr({ class: this.cfg.cssClass.navDot + " " + this.cfg.cssClass.rotateNavDot + " hidden" });
    }
    this.sl({ type: "nav", prop: navDot.info.id }, navDot.elem);
    // this.lline.tube.navs.push(navDot.elem); // store element

    chart.left = this.chartArea.offsetLeft;
    chart.top = this.chartArea.offsetTop;
    navDot.elem.drag(function drag(dx, dy, posx, posy) {
      if ((dx % 5) && (dy % 5)) {
        return;
      }

      var dragData = {
        dx: (navData.extra && navData.extra.constx ? 0 : dx),
        dy: (navData.extra && navData.extra.consty ? 0 : dy),
        posx: (posx - chart.left),
        posy: (posy - chart.top),
        state: "drag",
        transform: this.data("startTransform"),
        action: navData.action //move or rotate
      };


      if (navData.action === "move") {
        this.transform(dragData.transform + (dragData.transform ? "T" : "t") + [dragData.dx, dragData.dy]); // transform navDot
      } else if (navData.action === "rotate" && (!navData.extra || (navData.extra && !navData.extra.constx && !navData.extra.consty))) {
        dragData.angle = Snap.angle(navRotate.x, navRotate.y, dragData.posx, dragData.posy) - initAngle;
        this.transform(dragData.transform + (dragData.transform ? "R" : "r") + [dragData.angle, navRotate.x, navRotate.y]); //rotate navDot
      }
      dragData.elemId = navData.elemId || "tube";
      cb && cb(dragData);
    }, function startDrag() {
      if (navData.action === "rotate") {
        initAngle = self.navsAngle(navData.elemId);
        navRotate = self.getAxis(navData.elemId, "move");
      }
      this.data("startTransform", this.transform().local);
      cb && cb({ state: "start", elemId: navData.elemId || "tube", action: navData.action });
    }, function finishDrag() {
      cb && cb({ state: "finish", elemId: navData.elemId || "tube", action: navData.action });
    }); //drag
  };

  /**
   * mvElem Method.
   * @desc Move Element(elemID) from group to parent
   * @desc Get group transform and set to moved element
   * @desc Remove of last element in group - Destroy group.
   *
   * @param {string} elemID - Move element ID.
   *
   *  FIRST move Element
   *  SECOND move Transform from group to new Element
   *  THIRD last element destroy group
   */
  Lines.prototype.mvElem = function(elemID) {
    var elem, groupElem, groupParentElem;

    elem = this.getId(elemID);
    groupElem = elem.parentNode; // element group
    groupParentElem = groupElem.parentNode;
    elem.remove();
    // add transform from group to element
    elem.setAttribute("transform", window.getComputedStyle(groupElem).transform);

    // destroy group if it is empty
    if (!groupElem.childNodes.length) {
      groupElem.remove();
    }
    groupParentElem.append(elem);
  };

  /**
   * getAxis Method.
   * @desc Get navDot Axis for live Element(liveElemID)
   * 
   * @desc The ID of liveElement - consist of type + moveNavDotKEY + rotate NavDotKey
   * live-line-0-1 > type: line, moveNavDot KEY: 0, rotateNavDot KEY: 1
   *
   * @param {string} liveElemID - live element ID.
   * @param {string} navType - live element ID.
   *
   * @return {object} axis - all: {move & rotate}, move: {moveX & moveY}
   */
  Lines.prototype.getAxis = function(liveElemID, navType = "all") {
    var dotsElements, navdot = {},
      axis = {};

    dotsElements = this.getNavDot(liveElemID);

    navdot.moveAxis = dotsElements.move.getBBox();
    navdot.rotateAxis = dotsElements.rotate.getBBox();

    if (navType === "all") {
      axis.move = { x: navdot.moveAxis.cx, y: navdot.moveAxis.cy };
      axis.rotate = { x: navdot.rotateAxis.cx, y: navdot.rotateAxis.cy };
    } else if (navType === "move") {
      axis = { x: navdot.moveAxis.cx, y: navdot.moveAxis.cy };
    } else if (navType === "rotate") {
      axis = { x: navdot.rotateAxis.cx, y: navdot.rotateAxis.cy };
    }

    return axis;
  };

  //angle between first & second navDots
  Lines.prototype.navsAngle = function(liveElemID) {
    var axis, angle;
    axis = this.getAxis(liveElemID);
    angle = Snap.angle(axis.move.x, axis.move.y, axis.rotate.x, axis.rotate.y);

    return this.f(angle, 3);
  };

  //get NavDot for liveElementID
  // type = move or rotate or all
  Lines.prototype.getNavDot = function(liveElemID, navType = "all") {
    var navdot = {},
      resultNavDot = {};

    navdot.keys = this.splitId(liveElemID, true).navdot;
    navdot.moveID = this.makeId({ type: "nav", nav1: navdot.keys[0] }, true);
    navdot.rotateID = this.makeId({ type: "nav", nav1: navdot.keys[1] }, true);

    navdot.moveElem = this.gl({ type: "nav", prop: navdot.moveID });
    navdot.rotateElem = this.gl({ type: "nav", prop: navdot.rotateID });
    if (navType === "move") {
      resultNavDot = navdot.moveElem;
    } else if (navType === "rotate") {
      resultNavDot = navdot.rotateElem;
    } else {
      resultNavDot.move = navdot.moveElem;
      resultNavDot.rotate = navdot.rotateElem;
    }

    return resultNavDot;
  };

  // findY with X
  // find line slope between two points
  // slope = (y2 - y1) / (x2 - x1);
  // b = y1 - (slope * x1);
  // return {pixel, value}
  // 1-----period0--------2----------period1---------3
  //toDO : optimize function remove all this from here ...
  Lines.prototype.findY = function(x) {
    var points, period, foundY = { pixel: 0, value: 0 },
      point1, point2, slope, b;

    points = this.gg("points");

    // period = (x - this.chartArea.zeroX) / this.gg("stepX");
    period = (this.chartArea.zeroX - x) / this.gg("stepX");
    period = parseInt(period); // do not change with this.f !!!

    if (!points || !points[period] || !points[(period + 1)])
      return false;

    point1 = points[period];
    point2 = points[period + 1];

    slope = (point2[1] - point1[1]) / (point2[0] - point1[0]);
    b = point1[1] - (slope * point1[0]);

    foundY.pixel = (slope * x) + b;
    foundY.pixel = (foundY.pixel > 0) ? Math.round(foundY.pixel) : 0;

    foundY.value = (this.chartArea.zeroY - foundY.pixel) / this.gg("stepY") + this.gg("min");
    foundY.value = this.f(foundY.value, 5);

    return foundY;
  };

  Lines.prototype.pr = function(consoleText) {
    this.debug && console.log(consoleText);
  };

  Lines.prototype.drawDebug = function(pointAxis) {
    var debug = {};
    if (this.debug && pointAxis) {
      debug.info = {
        type: this.TYPESVG.circle,
        axis: pointAxis,
        r: this.cfg.debug.radius,
        class: this.cfg.cssClass.debugDot
      };
      debug.elem = this.drawSVG(debug.info);
      this.store({ type: this.TYPE.debug }, debug.elem);
    }
  };

  //svg = {lines:{}, candles:{}, labes:{}, points:{}, smas:{}}
  // singleFlag mean to not create group and set directly id to the element
  // typeObj = {type:, length:, color: }

  //dataObj = {type: type, sigle: true, length: length}
  Lines.prototype.store = function(storeInfo, storeData) {
    var elemID, prop;
    elemID = this.makeId(storeInfo);
    prop = storeInfo.prop || "elem";

    this.elms[storeInfo.type] || (this.elms[storeInfo.type] = {});
    this.elms[storeInfo.type][elemID] || (this.elms[storeInfo.type][elemID] = {});
    if (storeInfo.single) {
      this.elms[storeInfo.type][elemID][prop] = storeData;
    } else if (prop === "elem") {
      if (!this.elms[storeInfo.type][elemID]["elem"]) {
        this.elms[storeInfo.type][elemID]["elem"] = this.snap.g();
      }
      this.elms[storeInfo.type][elemID]["elem"].add(storeData);
    } else {
      this.elms[storeInfo.type][elemID][prop] = storeData;
    }

    // if property is element set ID
    (prop === "elem") && (this.elms[storeInfo.type][elemID]["elem"].node.id = elemID);
    (this.elms.id.indexOf(elemID) === -1) && this.elms.id.push(elemID);
  };

  // element GET
  // elemInfo = {type: TYPE, id: ID}
  Lines.prototype.eg = function(elemInfo = {}) {
    var prop;
    if (!this.elms[elemInfo.type]) {
      return 0;
    }
    prop = elemInfo.prop || "svg";

    return this.elms[elemInfo.type][elemInfo.id][prop];
  };

  // getByProp valid only for init and line TYPE
  Lines.prototype.gg = function(simpleType) {
    return this.g({ type: this.TYPE.init, prop: simpleType }) || this.g({ type: this.TYPE.line, prop: simpleType }) || false;
  };

  // getter from Dataset(dset)
  // getInfo.type: init || lines || candles || sma || ema -> 
  // default type is init
  // getInfo.prop: different .... 
  Lines.prototype.g = function(getInfo = {}) {
    var type;
    type = getInfo.type || "init";
    if (!this.dset[type]) {
      return 0;
    }

    return getInfo.prop ?
      this.dset[type][getInfo.prop] : this.dset[getInfo.type];
  };

  // setter for Dataset(dset)
  // storeInfo.type = same as g
  // storeInfo.prop = 
  // setData = data for store
  Lines.prototype.s = function(setInfo = {}, setData) {
    if (!setInfo.type || !setInfo.prop) {
      return 1;
    } else if (!this.dset[setInfo.type]) {
      return 2;
    }

    //inject secureINIT data into INIT property
    if (setInfo.type === this.TYPE.init && this.g({ type: this.TYPE.sinit, prop: setInfo.prop })) {
      setData = this.g({ type: this.TYPE.sinit, prop: setInfo.prop });
    }

    //store into dset
    this.dset[setInfo.type][setInfo.prop] = setData;
  };

  //Restore init properties
  // retrieve
  Lines.prototype.restore = function() {
    var initProp;
    for (initProp in this.dset[this.TYPE.sinit]) {
      this.s({ type: this.TYPE.init, prop: initProp }, this.dset[this.TYPE.sinit][initProp]);
    }
  };

  //change value of property and return new value
  Lines.prototype.action = function(actionInfo, changeObj) {
    if (!actionInfo.type || !actionInfo.prop || !changeObj.action || typeof changeObj.value === "undefined") {
      return 0;
    } else if (!this.dset[actionInfo.type]) {
      return 0;
    }

    if (changeObj.action === "+") {
      this.dset[actionInfo.type][actionInfo.prop] += changeObj.value;
    } else if (changeObj.action === "-") {
      this.dset[actionInfo.type][actionInfo.prop] -= changeObj.value;
    }

    return this.f(this.dset[actionInfo.type][actionInfo.prop], 5);
  };

  //format
  Lines.prototype.f = function(_number, fixDigit) {
    var _fix = (fixDigit || fixDigit === 0) ? fixDigit : 5;
    var _num = parseFloat(_number);
    return Math.abs(_num.toFixed(_fix));
    // return _num.toFixed(_fix);
  };

  // Generate element ID based on type & length and navDots
  // svg-sma-20 for chart element > chart type SMA with length 20 periods
  // lline-2-3 > live line with navDot 2 & 3
  // !!!  if nav1 did not provide automatic take navigation Dots length
  Lines.prototype.makeId = function(elemInfo, liveElementFlag = false) {
    var elemID;

    if (elemInfo.id) {
      return elemInfo.id;
    }

    if (liveElementFlag) {
      elemID = "live-" + elemInfo.type;
      if (elemInfo.nav1 !== undefined) {
        elemID += "-" + elemInfo.nav1;
        elemID += elemInfo.nav2 ? "-" + elemInfo.nav2 : "";
      } else {
        var dotLen = (this.gl({ type: "navid" }) || []).length;
        dotLen = dotLen ? dotLen - 1 : dotLen;
        elemID += "-" + dotLen;
      }
    } else {
      elemID = "svg-" + elemInfo.type;
      elemID += elemInfo.length ? "-" + elemInfo.length : "";
    }

    return elemID;
  };

  // svg-sma-20 => {type: SMA, length: 20}
  // live-line-2-3 => {type: line, navdot: [2, 3]}
  Lines.prototype.splitId = function(elemID, liveElement = false) {
    var idArray, idData = {};

    idArray = elemID.split("-");
    idData.type = idArray[1];
    //if SMA or EMA
    if ([this.TYPE.sma, this.TYPE.ema].indexOf(idData.type) !== -1) {
      idData.type = idData.type.toUpperCase();
    } else if (!liveElement) {
      idData.type = idData.type[0].toUpperCase() + idData.type.slice(1);
    }
    //for live elements we have more data
    if (idArray[3]) {
      idData.navdot = [idArray[2], idArray[3]];
    } else if (idArray[2]) {
      idData.length = parseInt(idArray[2]);
    }

    return idData;
  };

  Lines.prototype.getId = function(elemID, snap = false) {
    var elem;
    elem = snap ? this.snap.select("#" + elemID) : document.getElementById(elemID);
    return elem || 0;
  };

  // Show/Hide chartType
  Lines.prototype.toggle = function(chartType) {
    var elemID, elem;

    if (chartType === "all") {
      for (var k in this.elms) {
        k !== "id" && this.toggle(k);
      }
    } else if (this.cfg.chart.type.indexOf(chartType) !== -1) {
      for (elemID in this.elms[chartType]) {
        elem = this.getId(elemID);
        if (!elem.style.display || elem.style.display === "block") {
          elem.style.display = "none";
          this.store({ type: chartType, id: elemID, prop: "hide" }, true);
          // remove elemID from elms.id
          var rmKey = this.elms.id.indexOf(elemID);
          this.elms.id = this.elms.id.filter((i, k) => k !== rmKey);
        } else {
          elem.style.display = "block";
          this.store({ type: chartType, id: elemID, prop: "hide" }, false);
          this.elms.id.push(elemID);
        }
      }
    }
  };

  // remove chart DOM elements
  // chartType = this.TYPE
  Lines.prototype.remove = function(chartType = "all") {
    for (var tk in this.elms) {
      for (var ek in this.elms[tk]) {
        if (tk !== "id" && (tk === chartType || chartType === "all")) {
          this.elms[tk][ek].elem.remove();
        }
      }
    }
  };

  Lines.prototype.random = function() {
    return Math.floor(Math.random() * 50);
  };

  // reset - more than remove
  // first remove every charts
  // reset dataSet(dset), remain only secureInit(sinit)
  // reset elements(elms)
  // if savePoints flag is set then save points
  Lines.prototype.reset = function(savePoints = false) {
    !savePoints && this.s({ type: this.TYPE.line, prop: "points" }, []);

    this.remove("all");

    //store rawAll if exist
    var rawAll = this.dset.init.rawAll; //???

    this.dset = {
      sinit: this.dset.sinit,
      init: {},
      line: { data: [], points: [] },
      candle: { winp: [], losep: [] },
      sma: { data: [], points: [], length: [] },
      ema: { data: [], points: [] }
    };

    this.elms = {
      id: []
    };

    rawAll && (this.dset.init.rawAll = rawAll);
  };

  //set elements attributes...
  Lines.prototype.colorize = function() {
    for (var eKey in this.elms.id) {
      this.setAttr(this.elms.id[eKey]);
    }

    // lose candles
    this.colorCandle(0);
    // win candles
    this.colorCandle(1);
  };

  // set DOM elements attributes with values from external style
  // this need to be done before print as CANVAS
  Lines.prototype.colorCandle = function(candleType = 0) {
    var celems, cclass = ["lcandle", "wcandle"],
      cstyle;


    celems = document.getElementsByClassName(cclass[candleType]);
    for (var ek in celems) {
      if (celems[ek] instanceof Element) {
        cstyle = getComputedStyle(celems[ek]);
        celems[ek].setAttribute("fill", cstyle.fill);
        celems[ek].setAttribute("stroke", cstyle.stroke);
      }
    }
  };

  Lines.prototype.setAttr = function(elemID) {
    var elem, elemProp;
    elem = this.getId(elemID);
    elemProp = this.getStyle(elemID);

    elemProp.fill && elem.setAttribute("fill", elemProp.fill);
    elemProp.stroke && elem.setAttribute("stroke", elemProp.stroke);
  };

  Lines.prototype.toBase64 = function() {
    var _xml;

    _xml = new XMLSerializer().serializeToString(this.el);
    _xml = btoa(_xml);

    return "data:image/svg+xml;base64," + _xml;
  };

  // return fill & stroke computet styles
  Lines.prototype.getStyle = function(elemId) {
    var elem, style;
    elem = this.getId(elemId);
    if (elem) {
      style = getComputedStyle(elem);
    }

    return { fill: (style.fill != "none" ? style.fill : false), stroke: (style.stroke != "none" ? style.stroke : false) };
  };

  // return dom Element with ID canvasID
  Lines.prototype.getCanvas = function(canvasID = false) {
    var canElem, canCtx, img;

    this.colorize();

    canElem = document.createElement("canvas");
    canElem.id = canvasID || "linesCanvas";
    canCtx = canElem.getContext("2d");
    canElem.width = this.chartArea.w;
    canElem.height = this.chartArea.h;

    img = new Image();
    img.onload = function() {
      canCtx.drawImage(img, 0, 0);
    };
    img.src = this.toBase64();

    return canElem;
  };

  Lines.prototype.getImg = function (imgID = false) {
    var imgElem;

    this.colorize();

    imgElem = document.createElement("img");
    imgElem.setAttribute("src", this.toBase64());

    imgElem.setAttribute("width", this.chartArea.w);
    imgElem.setAttribute("height", this.chartArea.h);

    return imgElem;
  };

  // move all charts 
  // with one step forward or back
  // moveType prev or next
  Lines.prototype.move = function(moveType = "prev") {
    var offset, ids;

    // var allRaw = this.g({ type: this.TYPE.sinit, prop: "allraw" }) || this.gg("raw");
    offset = this.g({ type: this.TYPE.sinit, prop: "offset" }) || 0;
    if (moveType === "prev") {
      offset += this.cfg.step.offset;
    } else if (moveType === "next") {
      offset -= this.cfg.step.offset;
    }
    
    if (this.gg("stepX") > (this.cfg.step.xMax - 35) || this.gg("stepX") < this.cfg.step.xMin) {
      this.pr("step X reach the limit:", this.gg("stepX"));
      return;
    } else if (offset < 0) {
      this.pr("offset can not be negative");
      return;
    }

    var oldData = this.gg("allraw");

    this.s({ type: this.TYPE.sinit, prop: "offset" }, offset);
    ids = this.elms.id;
    this.reset();
    this.data(oldData);
    this.redraw(ids);
  };

  // zoom in/out all charts 
  // change stepX value...
  // did not need to recalculate everething from begining
  // only change stepX and redraw ...
  Lines.prototype.zoom = function(type = "in") {
    var stepX, ids;

    stepX = this.gg("stepX");
    if (type === "in") {
      stepX += this.cfg.step.zoom;
    } else if (type === "out") {
      stepX -= this.cfg.step.zoom;
    }

    if (stepX > this.cfg.step.xMax || stepX < this.cfg.step.xMin) {
      this.pr("step X reach the limit", stepX);
      return;
    }
    this.s({ type: this.TYPE.sinit, prop: "stepX" }, stepX);

    // var oldData = this.gg("raw");
    var oldData = this.gg("allraw");

    ids = this.elms.id;
    this.reset();
    this.data(oldData);
    this.redraw(ids);
  };
})();

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = Lines;
}