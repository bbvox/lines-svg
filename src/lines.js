var Lines = Lines || {};

(function() {
  "use strict";

  Lines = function(elemId) {
    if (!this.getId(elemId)) {
      throw new Error("missing DOM Element !");
    } else if (!window.Snap) {
      throw Error("missing Snap.svg libs !");
    }

    this.el = this.getId(elemId);
    this.snap = window.Snap("#" + elemId);

    this.setup();
  };

  // Debug flag. When is set draw additional dots and debug messages
  Lines.prototype.debug = false;

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

  Lines.prototype.elems = {
    id: {},
    svg: {},
    count: 0
  };

  //
  Lines.prototype.elms = {
    id: []
  };

  // candle.winp store path string for win candle shadow
  // candle.losep store path string for lose candle shadow
  // sinit > secure init did not reset after 
  Lines.prototype.dset = {
    sinit: {},
    init: { raw: [], min: 0, max: 0, stepX: 0, stepY: 0, zeroY: 0 },
    line: { points: [], lastX: 0, lastY: 0 },
    candle: { width: 0, winp: [], losep: [] },
    sma: { data: [], points: [], lastX: 0, lastY: 0 },
    ema: { data: [], points: [], lastX: 0, lastY: 0 }
  };

  // Store draw methods for tail execution during animation
  // toDo - remove/combine it with cfg.DrawOrder
  Lines.prototype.drawOrder = [];

  // Configuration section:
  //  - chart = properties for graphic
  //  - cssClass = All style properties are external style. 
  Lines.prototype.cfg = {
    animate: false,
    chart: {
      type: ["line", "candle", "sma", "ema"],
      padding: 40,
      attr: { stroke: "#ddd", fill: "none", strokeWidth: 1 },
      textAttr: { "stroke-width": "0.1px", "font-family": "Verdana", "font-size": "12px", fill: "#000" },
      enableGrid: true,
      candleFill: 0.4,
      grids: 5,
      navDotRadius: 6
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
      navDot: "stnavdot"
    },
    smaLength: 5,
    emaLength: 10,
    magnetMode: 30,
    step: {
      x: 50,
      xMin: 20,
      xMax: 100,
      yMax: 20,
      arrow: 50,
      zoom: 10,
      offset: 10,
      xLegend: 100
    },
    debug: {
      radius: 3,
      attr: { stroke: "red" }
    },
    timeUnit: "15m",
    drawOrder: ["drawLine", "drawCandle", "drawSMA", "drawEMA"]
  };

  // Internal method 
  // - inialize chartArea: width, height, offset & zero Axis
  Lines.prototype.setup = function() {
    var elem, width, height;

    if (window.getComputedStyle) {
      elem = window.getComputedStyle(this.el);
      width = parseInt(elem.width);
      height = parseInt(elem.height);

      this.chartArea = {
        w: width,
        h: height,
        width: (width - (this.cfg.chart.padding * 2)),
        height: (height - (this.cfg.chart.padding * 2)),
        zeroX: this.cfg.chart.padding,
        zeroY: height - this.cfg.chart.padding,
        offsetLeft: this.el.offsetLeft || this.el.parentElement.offsetLeft || 0,
        offsetTop: this.el.offsetTop || this.el.parentElement.offsetTop || 0
      };

      // check if snap exist. for testing purposes
      this.snap && this.snap.attr(this.cfg.chart.attr);
    }
  };

  // Interface method
  // add Data for charts
  Lines.prototype.data = function(dataArray) {
    if (!(dataArray instanceof Array)) {
      return;
    }

    this.s({ type: this.TYPE.init, prop: "raw" }, dataArray);

    // array of close values
    var data = dataArray.map(item => this.f(item[3], 5)); //close value
    this.s({ type: this.TYPE.line, prop: "data" }, data);

    if (this.checkLen()) {
      this.dataInit().calculate();
    }
  };

  // Internal method
  // - check data length
  // toDo create pagging
  Lines.prototype.checkLen = function() {
    var data, stepX, perPage;

    data = this.gg("data");
    stepX = this.f((this.chartArea.width / data.length), 0);

    if (stepX > this.cfg.step.xMax) {
      stepX = this.cfg.step.xMax;
    } else if (stepX < this.cfg.step.xMin) {
      stepX = this.cfg.step.xMin;
    }
    this.s({ type: this.TYPE.init, prop: "stepX" }, stepX); //stepX

    perPage = this.f(this.chartArea.width / stepX, 0);

    if (data.length > perPage) {
      var offset, cuttedRaw, slice = {}, raw;
      
      raw = this.gg("raw");
      this.s({ type: this.TYPE.sinit, prop: "allraw" }, raw);
      offset = this.g({ type: this.TYPE.sinit, prop: "offset" }) || 0;
      console.log(">>>", offset);
      slice = {
        begin: (data.length - offset - perPage),
        end: (data.length - offset)
      };
      cuttedRaw = raw.slice(slice.begin, slice.end);
      this.s({ type: this.TYPE.sinit, prop: "slice" }, slice);
      this.reset();
      console.log(">>>", cuttedRaw);
      this.data(cuttedRaw);
      return false;
    }

    return true;
  };

  // initialize data set
  // calculate min, max value based on input data
  // calculate stepX
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

    this.chartInit();
    this.zeroInit();

    return this;
  };

  // store stepX & stepY into chartArea
  Lines.prototype.chartInit = function() {
    var step = {},
      amplitude;

    amplitude = this.f((this.gg("max") - this.gg("min")), 4);
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

  //////////////////////////////// CALCULATE CHART POINTS >>>
  //calculate axis points and store it into lines.points
  Lines.prototype.calculate = function() {
    var data, dataKey = 1,
      plen, pointOne = [];

    data = this.gg("data");

    pointOne[0] = this.gg("zeroX");
    pointOne[1] = this.gg("zeroY");

    //clear and add first point for lines [x, y]
    this.s({ type: this.TYPE.line, prop: "points" }, []);
    this.add({ type: this.TYPE.line, prop: "points" }, pointOne);

    this.s({ type: this.TYPE.line, prop: "lastX" }, pointOne[0]);
    this.s({ type: this.TYPE.line, prop: "lastY" }, pointOne[1]);

    plen = data.length;
    for (; dataKey < plen; dataKey++) {
      (this.calcPoint)(dataKey);
    }
  };

  // params = {type: CHART_TYPE, prop: "data"}
  Lines.prototype.calcPoint = function(dataKey, type = "line", propPostfix = "") {
    var prevPoint, point, params = { prop: "data" + propPostfix },
      diff;

    params.type = type;
    prevPoint = this.g(params)[dataKey - 1];
    point = this.g(params)[dataKey];

    if (point < prevPoint) {
      diff = prevPoint - point;
      this.plus(diff, type, propPostfix);
    } else if (point > prevPoint) {
      diff = point - prevPoint;
      this.minus(diff, type, propPostfix);
    } else {
      this.equal(point, type, propPostfix);
    }
  };

  /*
    increase lastX with stepX
    increase lastY with (increase * stepY)

    add new point[axisX, axisY] to chart type points
  */
  Lines.prototype.plus = function(increase, type, propPostfix) {
    var point = [],
      change = {};

    change.x = this.gg("stepX");
    point[0] = this.action({ type: type, prop: "lastX" + propPostfix }, { action: "+", value: change.x });

    change.y = this.f((increase * this.gg("stepY")), 5);
    point[1] = this.action({ type: type, prop: "lastY" + propPostfix }, { action: "+", value: change.y });

    this.add({ type: type, prop: "points" + propPostfix }, point);
  };

  /*
    increase lastX with stepX
    decrease lastY with (decrease * stepY)

    add new point[axisX, axisY] to chart type points
  */
  Lines.prototype.minus = function(decrease, type, propPostfix) {
    var point = [],
      change = {};

    change.x = this.gg("stepX");
    point[0] = this.action({ type: type, prop: "lastX" + propPostfix }, { action: "+", value: change.x });

    change.y = this.f((decrease * this.gg("stepY")), 5);
    point[1] = this.action({ type: type, prop: "lastY" + propPostfix }, { action: "-", value: change.y });

    this.add({ type: type, prop: "points" + propPostfix }, point);
  };

  //add lastX += stepX
  Lines.prototype.equal = function(value, type, propPostfix) {
    var point = {},
      change = {};

    change.x = this.gg("stepX");
    point[0] = this.action({ type: type, prop: "lastX" + propPostfix }, { action: "+", value: change.x });

    //did not change Y
    point[1] = this.g({ type: type, prop: "lastY" + propPostfix });

    //add to points
    this.add({ type: type, prop: "points" + propPostfix }, point);
  };

  //add Point to chart.points
  //pointAxis = [axisX, axisY]
  Lines.prototype.add = function(dataObj, pointAxis) {
    var points = this.g(dataObj);

    if (points instanceof Array) {
      points.push(pointAxis);
    } else if (typeof points === "number" || typeof points === "string") { // unused
      points += pointAxis;
    } else {
      points = [];
      points.push(pointAxis);
    }

    this.s(dataObj, points);
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

  //check if id Exist
  Lines.prototype.checkID = function (dataObj) {
    var elemID;
    elemID = dataObj.id || "svg-" + dataObj.type + (dataObj.length ? "-" + dataObj.length : "");
    return (this.elms.id.indexOf(elemID) !== -1);
  };

  // 
  Lines.prototype.splitId = function (elemID) {
    var idArray, idData = {};

    idArray = elemID.split("-");
    idData.type = idArray[1];
    //if SMA or EMA
    if ([this.TYPE.sma, this.TYPE.ema].indexOf(idData.type) !== -1) {
      idData.type = idData.type.toUpperCase();
    } else {
      idData.type = idData.type[0].toUpperCase() + idData.type.slice(1);
    }
    idArray[2] && (idData.length = parseInt(idArray[2]));

    return idData;
  }

  Lines.prototype.redraw = function (idArray) {
    var chart, key, fnName;
    idArray || (idArray = this.elms.id);
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
    var svg = {}, cube = {};
    cube.x = this.chartArea.w - this.cfg.step.xLegend;
    cube.y = rowObj.y;
    cube.width = cube.height = 20;

    svg.cube = this.snap.rect(cube.x, cube.y, cube.width, cube.height);
    svg.cube.attr({ fill: rowObj.color });
    svg.text = this.snap.text(cube.x + 30, cube.y + 15, rowObj.label);
    svg.textAttr = this.cfg.chart.textAttr;
    svg.textAttr.fill = rowObj.color;
    svg.text.attr(svg.textAttr);

    this.store({ type: this.TYPE.legend }, svg.cube);
    this.store({ type: this.TYPE.legend }, svg.text);

    svg.text.click(() => {
      alert("click Legend" + rowObj.id);
      console.log("QUICK ANIMATION OF THE CHART WITH SOME BLANK COLOR >>>>", this);
    });
  };

  Lines.prototype.drawAxis = function() {
    var lineAxis = [],
      yAxis, _linePath = "",
      gridStep, lk = 0;

    if (this.checkID({type: this.TYPE.axis})) {
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

    lineAxis[0] = [this.chartArea.zeroX, this.chartArea.zeroY];
    lineAxis[1] = [this.chartArea.width, this.chartArea.zeroY];
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
        [],
        []
      ],
      plen, _linePath = "",
      svg, lk = 0;

    plen = this.gg("points").length;
    lineAxis[0][0] = this.chartArea.zeroX + this.gg("stepX");
    lineAxis[0][1] = Math.floor(this.chartArea.zeroY + this.cfg.chart.padding / 2);
    lineAxis[1] = [lineAxis[0][0], lineAxis[0][1] + 4];
    xAxis = lineAxis[0][0] = lineAxis[1][0];
    for (; lk <= plen; lk++) {
      if (!(lk % 3)) {
        _linePath += "M" + xAxis + " " + lineAxis[0][1] + "L" + xAxis + " " + lineAxis[1][1];
        svg = this.snap.text(xAxis - 5, lineAxis[0][1] + 15, this.labelX(lk));
        svg.attr({ class: this.cfg.cssClass.textLabel });
        svg.attr(this.cfg.chart.textAttr);

        this.store({ type: this.TYPE.axis }, svg);
      }
      xAxis += this.gg("stepX");
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
      this.debugDot(point);

      point[1] -= step;
      label += txtStep;
    }
  };

  //calculate hours;
  //in minute
  //start date
  //start hour
  Lines.prototype.labelX = function(step) {
    var label, res = "";
    label = 840; //14
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

    if (this.checkID({type: this.TYPE.line})) {
      this.pr("Line chart already exist");
      return;
    }

    points = this.gg("points");
    plen = points.length - 1;

    for (; pkey < plen; pkey++) {
      lineAxis.push([points[pkey][0], points[pkey][1]]); // x1, y1
      lineAxis.push([points[pkey + 1][0], points[pkey + 1][1]]); // x2, y2
      _linePath += this.getPath(lineAxis);

      this.debugDot(lineAxis[0]);
      lineAxis = [];
    }

    this.debugDot(points[plen]); //last dot
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
      var svg = this.snap.path(lineProp.path);
      var svgAttr = {};
      svgAttr.class = lineProp.class || this.cfg.cssClass[lineProp.type];
      svg.attr(svgAttr);
      // handle repeating sma & ema charts
      if (this.exist(lineProp.type)) {
        var color = this.getHex();
        svg.attr({ style: "stroke: " + color });
        this.store({ type: lineProp.type, length: lineProp.length, prop: "color" }, color);
        this.drawLegend();
      }

      // axis & candle NEED group
      // if ([this.TYPE.axis, this.TYPE.candle].indexOf(lineProp.type) !== -1) {
      if (lineProp.type !== this.TYPE.axis && lineProp.type !== this.TYPE.candle) {
        lineProp.single = true;
      }

      this.store(lineProp, svg);
    }
  };

  // only sma & ema charts can be more than once
  Lines.prototype.exist = function (chartType) {
    if ([this.TYPE.sma, this.TYPE.ema].indexOf(chartType) === -1) {
      return false;
    }

    return !!this.elms[chartType];
  };

  //lineProp = {type; path; color; width; strokeDasharray}
  Lines.prototype.animatePath = function(lineProp, cbNext) {
    var svg, lineLen, svgAttr = {};

    svgAttr.class = lineProp.class || this.cfg.cssClass[lineProp.type];
    svg = this.snap.path(svgAttr);



    lineLen = Snap.path.getTotalLength(lineProp.path);
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
    // finish callback 
    // mina.elastic, mina.easeInOut, mina.easeIn, mina.backOut

  };

  Lines.prototype.getPath = function(lineAxis) {
    if (lineAxis.length !== 2) {
      return "";
    }
    var path = "M" + Math.floor(lineAxis[0][0]) + " " + Math.floor(lineAxis[0][1]);
    path += "L" + Math.floor(lineAxis[1][0]) + " " + Math.floor(lineAxis[1][1]);

    return path;
  };

  //
  Lines.prototype.drawCandle = function() {
    var width, raw, rkey;

    if (this.checkID({type: this.TYPE.candle})) {
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

  Lines.prototype.candle = function(cdata, key) {
    var point1, point2, candle = {},
      svg;

    point1 = this.gg("points")[key - 1];
    point2 = this.gg("points")[key];

    candle.data = cdata;
    candle.height = point1[1] - point2[1];
    candle.height = this.f(candle.height, 0);

    candle.width = this.g({ type: this.TYPE.candle, prop: "width" });

    candle.x = point1[0] + ((1 - this.cfg.chart.candleFill) / 2 * this.gg("stepX"));
    candle.x = this.f(candle.x, 0);
    if (point1[1] > point2[1]) {
      candle.class = this.cfg.cssClass.winCandle;
      candle.y = point2[1];
    } else {
      candle.class = this.cfg.cssClass.loseCandle;
      candle.y = point1[1];
    }
    svg = this.snap.rect(candle.x, candle.y, candle.width, candle.height);
    svg.attr({ class: candle.class });
    this.store({ type: this.TYPE.candle }, svg);
    this.candleShadow(candle, key);
  };

  /* candleShadow - top & bottom
   * 
   * @param {type} candle {data:{open, high, low, close}, width, height, x, y}
   * @param {type} color string
   */
  Lines.prototype.candleShadow = function(candle, period) {
    var lineX, lineTop, lineBot, _linePath = "";
    /* beautify preserve:start */
    lineTop = lineBot = [[], []];
    /* beautify preserve:end */

    lineX = candle.x + this.f((candle.width / 2), 0);

    lineTop[0] = [lineX, candle.y];
    lineTop[1][0] = lineX;
    lineTop[1][1] = (candle.data.high - candle.data.close) * this.gg("stepY");
    lineTop[1][1] = lineTop[0][1] - lineTop[1][1];
    _linePath += this.getPath(lineTop);

    lineBot[0][0] = lineX;
    lineBot[0][1] = lineTop[0][1] + candle.height;
    lineBot[1][0] = lineX;
    lineBot[1][1] = lineBot[0][1] + this.f(((candle.data.close - candle.data.low) * this.gg("stepY")), 0);
    _linePath += this.getPath(lineBot);
    // printed one BY one
    // this.printPath({ type: this.TYPE.candle, path: _linePath, class: candle.class });
    // return;

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

  //define lastX & lastY for SMA
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
    } else if (this.checkID({type: this.TYPE.sma, length: smaLength})) {
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

      this.debugDot(lineAxis[0]);
      lineAxis = [];
    }

    this.debugDot(lineAxis[plen]);
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

      this.add({ type: this.TYPE.ema, prop: "data" + emaLength }, this.f(ema.today, 4));
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

      this.debugDot(lineAxis[0]);
      lineAxis = [];
    }

    this.printPath({ type: this.TYPE.ema, path: _linePath, length: emaLength });
  };


  Lines.prototype.liveFlag = false;
  Lines.prototype.dragX = 0;

  //revision ...
  Lines.prototype.live = function() {
    var foundY, self = this,
      dot, label, left, dragX;

    if (this.cfg.animate && !this.liveFlag) {
      this.liveFlag = true;
      this.drawOrder.push("live");
      return;
    }

    label = this.snap.text(this.chartArea.zeroX, this.chartArea.zeroY, "");
    label.attr({ class: this.cfg.cssClass.liveLabel });

    dot = this.snap.circle(100, this.findY(100).pixel, this.cfg.debug.radius);
    dot.attr({ class: this.cfg.cssClass.liveDot });

    left = this.chartArea.offsetLeft;

    this.snap.mousemove((e, x) => {
      var cx;
      x -= left;
      if (x > this.chartArea.zeroX && !(x % 5)) {
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

    if (!this.lcGroup) {
      this.lcGroup = this.snap.g(this.elms.line["svg-line"].elem);
    }

    this.snap.drag((moveX, moveY) => {
      dragX = moveX;

      self.lcGroup.attr({ transform: "t" + (dragX + self.dragX) });
    }, () => {}, () => {
      self.dragX += dragX;
    });
  };

  Lines.prototype.llive = {};
  // http://jsfiddle.net/tM4L9/7/
  // mobile support
  // store multiple lines
  Lines.prototype.liveLine = function(extra = {}) {
    var self = this,
      elem = {},
      lineAxis = [],
      cnt = 0;

    elem.left = this.chartArea.offsetLeft;
    elem.top = this.chartArea.offsetTop;

    delete self.llive.last;

    this.snap.undrag();
    this.snap.unmousemove();
    this.snap.mousemove((e, dx, dy) => {
      if ((!(dx % 5) || !(dy % 5)) && self.llive.last) {
        lineAxis[1] = [(dx - elem.left), (dy - elem.top)];
        if (lineAxis[1][0] < 0 || lineAxis[1][0] > this.chartArea.width) {
          return;
        }
        var y = self.findY(lineAxis[1][0]);
        if (self.cfg.magnetMode && Math.abs(lineAxis[1][1] - y.pixel) < self.cfg.magnetMode) {
          lineAxis[1][1] = y.pixel;
        }
        self.llive.last.attr({ x2: lineAxis[1][0], y2: lineAxis[1][1] });

        extra.arrow && self.liveArrow([lineAxis[1], lineAxis[0]]);
        extra.tube && self.liveTube([lineAxis[1], lineAxis[0]]);
      }

      if (!cnt) {
        cnt = 1;
        // this.click((e, clickX, clickY) => {
        this.snap.click((e, clickX, clickY) => {
          cnt++;
          lineAxis[0] = [(clickX - elem.left), (clickY - elem.top)];
          lineAxis[1] = [(lineAxis[0][0] + this.cfg.chart.padding), (lineAxis[0][1] + this.cfg.chart.padding)];

          self.debugDot(lineAxis[0]);

          if (!self.llive.last) {
            self.llive.last = self.snap.line(lineAxis[0][0], lineAxis[0][1], lineAxis[1][0], lineAxis[1][1]);
            self.llive.last.attr({ class: self.cfg.cssClass.liveLine });

            extra.arrow && self.liveArrow([lineAxis[1]]);
            extra.tube && self.liveTube([lineAxis[1]]);
          }

          if (cnt === 3) {
            this.snap.unclick();
            self.snap.unmousemove();
          }
        });
      }
    });
  };

  Lines.prototype.liveArrow = function(lineAxis) {
    var points = [],
      size, angle = 0,
      apath = "";

    this.llive.arrow && this.llive.arrow.remove();

    size = this.cfg.step.arrow / 5;

    points.push([lineAxis[0][0] - size, lineAxis[0][1] + size]);
    points.push([lineAxis[0][0] + size, lineAxis[0][1] + size]);

    points.push(lineAxis[0]); //joint point
    if (lineAxis[1]) {
      angle = Snap.angle(lineAxis[0][0], lineAxis[0][1], lineAxis[1][0], lineAxis[1][1]);
      angle = this.f(angle, 0) + 90;
    }


    apath += this.getPath([points[0], points[2]]);
    apath += this.getPath([points[1], points[2]]);

    this.llive.arrow = this.snap.path(apath);
    this.llive.arrow.attr({ class: this.cfg.cssClass.liveLine });

    this.llive.arrow && this.llive.arrow.transform("r" + angle + "," + lineAxis[0][0] + "," + lineAxis[0][1]);
  };

  Lines.prototype.lline = {
    tube: {
      navs: []
    }
  };

  //live getter & setter
  // same as g & gg & s
  // if liveData exist setter else getter
  Lines.prototype.lgs = function(liveProp = "", liveData = false) {
    var liveObj = { type: "tube" };
    if (!liveProp) {
      return false;
    }

    liveObj.prop = liveProp;

    //set value
    if (liveData) {
      this.lline[liveObj.type][liveObj.prop] = liveData;
    }

    return this.lline[liveObj.type][liveObj.prop] || false;
  };

  Lines.prototype.liveTube = function(lineAxis = []) {
    var pts = [],
      tlines = {},
      self = this;

    if (lineAxis.length !== 2) {
      return;
    }
    pts[0] = [lineAxis[1][0], lineAxis[1][1]];
    pts[1] = [lineAxis[1][0] + (this.chartArea.width - lineAxis[1][0]), lineAxis[1][1]];
    pts[2] = [lineAxis[0][0], lineAxis[0][1]];
    pts[3] = [lineAxis[0][0] + (this.chartArea.width - lineAxis[0][0]), lineAxis[0][1]];

    tlines.angle = Snap.angle(lineAxis[0][0], lineAxis[0][1], lineAxis[1][0], lineAxis[1][1]);
    this.lgs("angle", tlines.angle);
    //live Tube
    if (!this.lgs("top") || !this.lgs("bott")) {
      tlines.top = this.snap.line(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
      tlines.top.attr({ class: this.cfg.cssClass.liveLine });
      tlines.bott = this.snap.line(pts[2][0], pts[2][1], pts[3][0], pts[3][1]).attr({ class: this.cfg.cssClass.liveLine });
      tlines.bott.attr({ class: this.cfg.cssClass.liveLine });
      this.lgs("top", tlines.top);
      this.lgs("bott", tlines.bott);

      //create group with top, bott and line
      tlines.group = this.snap.g(tlines.top, tlines.bott, this.llive.last);
      this.lgs("group", tlines.group);

      //navDot 0 - move Dot
      this.navDot(pts[0], function(dx, dy, posx, posy, begint) {
        this.transform(begint + (begint ? "T" : "t") + [dx, dy]); //navDot0 transform

        var _trans = self.lline.tube.grtr + (self.lline.tube.grtr ? "T" : "t") + [dx, dy];
        tlines.group.transform(_trans);
      }, () => {
        this.lline.tube.grtr = this.lgs("group").transform().local;
        //clear element transform because group have such
        this.lgs("navs")[1].transform("");
        this.lgs("group").add(this.lline.tube.navs[1]);
      }, () => {
        this.mvElem(this.lgs("navs")[1].node.id);
        // transfer group transform to navDot1
        this.lgs("navs")[1].transform(this.lgs("group").transform().local);
        var navsProp = this.lgs("navs")[0].getBBox();
        pts[0][0] = this.f(navsProp.x + 6, 0);
        pts[0][1] = this.f(navsProp.y + 6, 0);
      });

      // todo ADD PROMISES ... navDot1 then navDot2 ...
      this.navDot(pts[2], function(dx, dy, posx, posy, begint) {
        var _angle = Snap.angle(pts[0][0], pts[0][1], posx, posy) - self.lline.tube.navsAngle;
        this.transform(begint + (begint ? "R" : "r") + [_angle, pts[0][0], pts[0][1]]);

        var _trans = self.lline.tube.grtr + (self.lline.tube.grtr ? "R" : "r") + [_angle, pts[0][0], pts[0][1]];
        self.lgs("group").transform(_trans);
      }, () => {
        this.lline.tube.navsAngle = this.navsAngle();
        this.lline.tube.grtr = this.lgs("group").transform().local;
      });
    } else {
      tlines.angle -= 90;

      this.lgs("top").transform("r" + tlines.angle + "," + [pts[0][0], pts[0][1]]);
      this.lgs("bott").attr({ x1: pts[2][0], x2: pts[3][0] });
      this.lgs("bott").attr({ y1: pts[2][1], y2: pts[3][1] });
      this.lgs("bott").transform("r" + tlines.angle + "," + [pts[2][0], pts[2][1]]);
      this.lgs("navs")[1].attr({ cx: pts[2][0], cy: pts[2][1] });
    }
  };

  //remove Element from group and move to parent
  Lines.prototype.mvElem = function(elemID) {
    var parElem, elem = document.getElementById(elemID);
    parElem = elem.parentNode.parentNode;
    elem.remove();
    parElem.append(elem);
  };

  //angle between first & second navDots
  Lines.prototype.navsAngle = function() {
    var pts = [];
    pts[0] = this.lgs("navs")[0].getBBox();
    pts[1] = this.lgs("navs")[1].getBBox();

    var ang = Snap.angle(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
    return this.f(ang, 3);
  };

  // navigation DOT - heavy function 
  // todo - drag on mobile ... may be useless 
  // ON MOBILE CAN NOT MAKE ANY DRAW
  // http://jsfiddle.net/tM4L9/7/
  Lines.prototype.navDot = function(point, cbDrag, cbStart, cbEnd) {
    var navDot, elem = {},
      self = this;

    navDot = this.snap.circle(point[0] - 3, point[1] - 3, 6);
    navDot.attr({ class: this.cfg.cssClass.navDot });
    navDot.node.id = "navdot" + this.lgs("navs").length;

    this.lline.tube.navs.push(navDot);

    elem.left = this.chartArea.offsetLeft;
    elem.top = this.chartArea.offsetTop;

    navDot.drag(function Drag(dx, dy, posx, posy) {
      if (!(dx % 5) || !(dy % 5)) {
        cbDrag.call(this, dx, dy, (posx - elem.left), (posy - elem.top), this.data("beginTransform"));
      }
    }, function Start() {
      this.data("beginTransform", this.transform().local);
      cbStart && cbStart();
    }, function Finish() {
      cbEnd && cbEnd();
    });
  };

  // findY with X
  // find line slope between two points
  // slope = (y2 - y1) / (x2 - x1);
  // b = y1 - (slope * x1);
  // 
  // return {pixel, value}
  // 1-----period0--------2----------period1---------3
  //toDO : optimize function remove all this from here ...
  Lines.prototype.findY = function(x) {
    var points, period, foundY = { pixel: 0, value: 0 },
      point1, point2, slope, b;

    points = this.gg("points");

    period = (x - this.chartArea.zeroX) / this.gg("stepX");
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
    foundY.value = this.f(foundY.value, 4);

    return foundY;
  };

  Lines.prototype.pr = function(consoleText) {
    this.debug && console.log(consoleText);
  };

  Lines.prototype.debugDot = function(pointAxis) {
    var svg;
    if (this.debug && this.snap && pointAxis && pointAxis.length > 1) {
      svg = this.snap.circle(pointAxis[0], pointAxis[1], this.cfg.debug.radius);
      svg.attr({ class: this.cfg.cssClass.debugDot });
      this.store({ type: this.TYPE.debug }, svg);
    }
  };

  //svg = {lines:{}, candles:{}, labes:{}, points:{}, smas:{}}
  // singleFlag mean to not create group and set directly id to the element
  // typeObj = {type:, length:, color: }
  Lines.prototype.store2 = function(type, svgObject, singleFlag = false) {
    var elemID = "svg-" + type;

    //when have several sma append counter > sma1 sma2 ...
    if (this.elems.id[elemID] && singleFlag) {
      this.elems.count++;
      elemID += this.elems.count;
    }

    if (singleFlag) {
      this.elems.svg[type] = svgObject;
      this.elems.svg[type].node.id = elemID;
    } else {
      this.elems.svg[type] || (this.elems.svg[type] = this.snap.g());
      this.elems.svg[type].node.id = elemID;
      this.elems.svg[type].add(svgObject);
    }

    this.elems.id[elemID] = true;
  };

  // chartObj = {type, prop}
  // return array or element of value of property....
  Lines.prototype.get = function (chartObj) {
  };

  //dataObj = {type: type, sigle: true, length: length}
  Lines.prototype.store = function(dataObj, storeData) {
    var elemID, prop;
    elemID = dataObj.id || "svg-" + dataObj.type + (dataObj.length ? "-" + dataObj.length : "");
    prop = dataObj.prop || "elem";

    this.elms[dataObj.type] || (this.elms[dataObj.type] = {});
    this.elms[dataObj.type][elemID] || (this.elms[dataObj.type][elemID] = {});
    if (dataObj.single) {
      this.elms[dataObj.type][elemID][prop] = storeData;
    } else if (prop === "elem") {
      if (!this.elms[dataObj.type][elemID]["elem"]) {
        this.elms[dataObj.type][elemID]["elem"] = this.snap.g();
      }
      this.elms[dataObj.type][elemID]["elem"].add(storeData);
    } else {
      this.elms[dataObj.type][elemID][prop] = storeData;
    }

    // if property is element set ID
    (prop === "elem") && (this.elms[dataObj.type][elemID]["elem"].node.id = elemID);
    (this.elms.id.indexOf(elemID) === -1) && this.elms.id.push(elemID);
  };

  // element GET
  // elemObj = {type: TYPE, id: ID}
  Lines.prototype.eg = function(elemObj = {}) {
    var prop;
    if (!this.elms[elemObj.type]) {
      return 0;
    }
    prop = elemObj.prop || "svg";

    return this.elms[elemObj.type][elemObj.id][prop];
  };

  // getByProp valid only for init and line TYPE
  Lines.prototype.gg = function(simpleType) {
    return this.g({ type: this.TYPE.init, prop: simpleType }) || this.g({ type: this.TYPE.line, prop: simpleType }) || false;
  };

  //getter from dset =
  // dataObj.type: init || lines || candles || sma || ema -> default init
  // dataObj.prop: different .... 
  // better to be more strict into return data ...
  Lines.prototype.g = function(dataObj = {}) {
    var type;
    type = dataObj.type || "init";
    if (!this.dset[type]) {
      return 0;
    }

    return dataObj.prop ?
      this.dset[type][dataObj.prop] : this.dset[dataObj.type];
  };

  //setter
  //dataObj.type = same as g
  //dataObj.prop = 
  //data = data for store
  Lines.prototype.s = function(dataObj = {}, data) {
    if (!dataObj.type || !dataObj.prop) {
      console.error("exit 1")
      return 1;
    } else if (!this.dset[dataObj.type]) {
      return 2;
    }

    //inject secureINIT data into INIT property
    if (dataObj.type === this.TYPE.init && this.g({ type: this.TYPE.sinit, prop: dataObj.prop })) {
      data = this.g({ type: this.TYPE.sinit, prop: dataObj.prop });
    }

    //store into dset
    this.dset[dataObj.type][dataObj.prop] = data;
  };

  //change value of property and return new value
  Lines.prototype.action = function(dataObj, changeObj) {
    if (!dataObj.type || !dataObj.prop || !changeObj.action || typeof changeObj.value === "undefined") {
      return 0;
    } else if (!this.dset[dataObj.type]) {
      return 0;
    }

    if (changeObj.action === "+") {
      this.dset[dataObj.type][dataObj.prop] += changeObj.value;
    } else if (changeObj.action === "-") {
      this.dset[dataObj.type][dataObj.prop] -= changeObj.value;
    }

    return this.f(this.dset[dataObj.type][dataObj.prop], 5);
  };

  //format
  Lines.prototype.f = function(_number, fixDigit) {
    var _fix = (fixDigit || fixDigit === 0) ? fixDigit : 5;
    var _num = parseFloat(_number);
    return Math.abs(_num.toFixed(_fix));
    // return _num.toFixed(_fix);
  };

  Lines.prototype.getId = function(elemID, snap = false) {
    var elem;
    elem = snap ? this.snap.select("#" + elemID) : document.getElementById(elemID);
    return elem || 0;
  };

  //this.store({ type: lineProp.type, length: lineProp.length, prop: "color" }, color);
  Lines.prototype.toggle = function(chartType) {
    var elemID, elem;
    
    if (chartType === "all") {
      for (var k in this.elms) {
        k !== "id" && this.toggle(k);
      }
    } else if (this.cfg.chart.type.indexOf(chartType) !== -1) {
      for (var elemID in this.elms[chartType]) {
        elem = this.getId(elemID);
        if (!elem.style.display || elem.style.display === "block") {
          elem.style.display = "none";
          this.store({type: chartType, id: elemID, prop: "hide"}, true);
          // remove elemID from elms.id
          var rmKey = this.elms.id.indexOf(elemID);
          this.elms.id = this.elms.id.filter((i, k) => k !== rmKey);
        } else {
          elem.style.display = "block";
          this.store({type: chartType, id: elemID, prop: "hide"}, false);
          this.elms.id.push(elemID);
        }
      }
    }
  };

  ////////////////////////////////////////
  Lines.prototype.remove = function(chart = "all") {
    for (var tk in this.elms) {
      for (var ek in this.elms[tk]) {
        if (tk !== "id" && (tk === chart || chart === "all")) {
          this.elms[tk][ek].elem.remove();
        }
      }
    }

    return;
    switch (chart) {
      case this.TYPE.axis:
        this.elems.svg[this.TYPE.axis].remove();
        break;
      case this.TYPE.line:
        this.elems.svg[this.TYPE.line].remove();
        break;
      case this.TYPE.candle:
        this.elems.svg[this.TYPE.candle].remove();
        break;
      case this.TYPE.point:
        this.elems.svg[this.TYPE.point].remove();
        break;
      case this.TYPE.sma:
        this.elems.svg[this.TYPE.sma].remove();
        break;
      case this.TYPE.ema:
        this.elems.svg[this.TYPE.ema].remove();
        break;
      case "all":
        for (var k in this.TYPE) {
          this.elems.svg[this.TYPE[k]] && this.elems.svg[this.TYPE[k]].remove();
        }
        this.elems.svg = {};
        break;
    }
  };

  Lines.prototype.random = function() {
    return Math.floor(Math.random() * 50);
  };

  //if savePointsFlag is set save points
  // dublicate with remove ....
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

    this.colorCandle(0);
    this.colorCandle(1);
  };

  Lines.prototype.colorCandle = function (candleType = 0) {
    var celems, cclass = ["lcandle", "wcandle"], cstyle;


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

  // toDo - store drawed charts 
  // toDo - store showed/hide elems
  Lines.prototype.move = function(type = "prev") {
    var offset, allRaw, limit = {}, ids;

    allRaw = this.g({ type: this.TYPE.sinit, prop: "allraw" }) || this.gg("raw");
    offset = this.g({ type: this.TYPE.sinit, prop: "offset" }) || 0;

    if (type === "prev") {
      offset += this.cfg.step.offset;
    } else {
      offset -= this.cfg.step.offset;
    }
    this.s({ type: this.TYPE.sinit, prop: "offset" }, offset);
    ids = this.elms.id;
    this.reset();

    this.data(allRaw);
    this.redraw(ids);
  };

  //zoom in or out change stepX value...
  // did not need to recalculate everething from begining
  // only change stepX and redraw ...
  Lines.prototype.zoom = function(type = "in") {
    var oldData, stepX, ids;

    oldData = this.gg("raw");

    stepX = this.gg("stepX");

    if (type === "in") {
      stepX += this.cfg.step.zoom;
    } else if (type === "out") {
      stepX -= this.cfg.step.zoom;
    }
    this.s({ type: this.TYPE.sinit, prop: "stepX" }, stepX);
    ids = this.elms.id;
    this.reset();

    this.data(oldData);
    this.redraw(ids);
  };
})();

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = Lines;
}

/////////////////////////////////////
/*
https://gist.github.com/austinhyde/4321f22a476e1cbee65f
var _n = 5, _nListeners = [];
function n(n) {
  if (arguments.length && n !== _n) {
    _n = n;
    _nListeners.forEach(function(listener) { listener(n); });
  }
  return _n;
}
n.subscribe = function(listener) { _nListeners.push(listener); }

console.log(n()); // 5
n.subscribe(function(newN) { console.log(newN); });
n(10); // logs 10
n(10); // no output, value didn't change.


        http://jsfiddle.net/hungerstar/AP6e9/3/

REFERENCES ::::
// http://jsfiddle.net/fuzic/kKLtH/
/ http://jsfiddle.net/hungerstar/AP6e9/3/
*/