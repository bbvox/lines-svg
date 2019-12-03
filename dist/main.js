(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Lines"] = factory();
	else
		root["Lines"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./lib/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./lib/calc.js":
/*!*********************!*\
  !*** ./lib/calc.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }\n\nfunction _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\nfunction _typeof(obj) { if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nvar store = __webpack_require__(/*! ./store */ \"./lib/store.js\");\n\nvar utils = __webpack_require__(/*! ./utils */ \"./lib/utils.js\");\n\nvar _require = __webpack_require__(/*! ./config */ \"./lib/config.js\"),\n    cfg = _require.config;\n\nvar Calc =\n/*#__PURE__*/\nfunction () {\n  function Calc() {\n    _classCallCheck(this, Calc);\n  }\n\n  _createClass(Calc, [{\n    key: \"start\",\n    // instead of constructor\n    value: function start() {\n      this.init();\n      this.initSteps();\n    } // min, max & attitude\n\n  }, {\n    key: \"init\",\n    value: function init() {\n      var data = store.get(\"data\");\n      var init = {\n        len: data.length,\n        min: data[0],\n        max: data[0],\n        amplitude: 0,\n        zero: data[0]\n      };\n      data.forEach(function (item) {\n        if (init.min > item) init.min = item;\n        if (init.max < item) init.max = item;\n      });\n      init.amplitude = utils.f(init.max - init.min);\n      this.save(init);\n    } // stepX, stepY, zeroX & zeroY\n\n  }, {\n    key: \"initSteps\",\n    value: function initSteps() {\n      var _store$mget = store.mget([\"area\", \"amplitude\", \"len\", \"zero\", \"min\"]),\n          area = _store$mget.area,\n          amplitude = _store$mget.amplitude,\n          len = _store$mget.len,\n          zero = _store$mget.zero,\n          min = _store$mget.min;\n\n      var stepX = 0,\n          stepY = 0,\n          zeroX = 0,\n          zeroY = 0;\n      stepX = utils.f(area.width / len, 0);\n      stepY = utils.f(area.height / amplitude, 0);\n      zeroX = area.zeroX;\n      zeroY = utils.f(area.zeroY - (zero - min) * stepY, 0);\n      this.save({\n        stepX: stepX,\n        stepY: stepY,\n        zeroX: zeroX,\n        zeroY: zeroY\n      });\n    } // CALCULATE LINE CHART AXIS POINTS //////////\n    // calculate axis points and store it into lines.points - points\n    // pointOne = [axisX, axisY]\n    // this.TYPE.points = [[x0,y0], [x1, y1].....[x88,y88]]\n    // main -> calcPoint -> nextPoint\n\n  }, {\n    key: \"main\",\n    value: function main() {\n      this.lines();\n      this.candle();\n    }\n  }, {\n    key: \"lines\",\n    value: function lines() {\n      var _store$mget2 = store.mget([\"data\", \"zeroX\", \"zeroY\", \"len\"]),\n          data = _store$mget2.data,\n          zeroX = _store$mget2.zeroX,\n          zeroY = _store$mget2.zeroY,\n          len = _store$mget2.len;\n\n      var _store$mget3 = store.mget([\"stepX\", \"stepY\"]),\n          stepX = _store$mget3.stepX,\n          stepY = _store$mget3.stepY;\n\n      store.push(\"line.points\", [zeroX, zeroY]); // point ONE\n\n      this.tmp = {\n        data: data,\n        stepX: stepX,\n        stepY: stepY,\n        lastX: zeroX,\n        lastY: zeroY\n      };\n\n      for (var pIndex = 1; pIndex < len; pIndex++) {\n        this.calcPoint(pIndex);\n      }\n    } // walk through whole data Array\n\n  }, {\n    key: \"calcPoint\",\n    value: function calcPoint(dataIndex) {\n      var prev = this.tmp.data[dataIndex - 1];\n      var current = this.tmp.data[dataIndex];\n\n      if (current < prev) {\n        this.nextPoint(prev - current, \"plus\");\n      } else if (current > prev) {\n        this.nextPoint(current - prev, \"minus\");\n      } else {\n        this.nextPoint(current, \"equal\");\n      }\n    } //calc next point\n\n  }, {\n    key: \"nextPoint\",\n    value: function nextPoint(diff, type) {\n      var nextY;\n      var nextX = this.tmp.lastX + this.tmp.stepX;\n      var diffY = diff * this.tmp.stepY;\n      nextY = this.tmp.lastY;\n\n      if (type === \"plus\") {\n        nextY += diffY;\n      } else if (type === \"minus\") {\n        nextY -= diffY;\n      } else if (type === \"equal\") {\n        nextY = diffY;\n      }\n\n      store.push(\"line.points\", [utils.f(nextX, 0), utils.f(nextY, 0)]);\n      this.tmp.lastX = nextX;\n      this.tmp.lastY = nextY;\n    }\n  }, {\n    key: \"yAxis\",\n    value: function yAxis() {\n      var _store$mget4 = store.mget([\"amplitude\", \"area\", \"min\"]),\n          amplitude = _store$mget4.amplitude,\n          area = _store$mget4.area,\n          min = _store$mget4.min;\n\n      var totalGrids = cfg.chart.totalGrids;\n      console.log(\"-\", amplitude, area, min);\n      var labelDiff = utils.f(amplitude * (1 / totalGrids), 7);\n      return {\n        xAxis: area.zeroX,\n        yAxis: area.zeroY,\n        label: min,\n        labelDiff: labelDiff\n      };\n    } // split into categories ... lines, candles, smas, emas ...\n\n  }, {\n    key: \"save\",\n    value: function save(storeData) {\n      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : \"line\";\n\n      if (_typeof(storeData) === \"object\") {\n        store.mset(storeData);\n      }\n    } // CANDLE - candleStick\n\n  }, {\n    key: \"candle\",\n    value: function candle() {\n      var _this = this;\n\n      var _store$mget5 = store.mget([\"points\", \"stepX\", \"stepY\", \"raw\"]),\n          points = _store$mget5.points,\n          stepX = _store$mget5.stepX,\n          stepY = _store$mget5.stepY,\n          ohlcData = _store$mget5.raw;\n\n      var candleFill = cfg.chart.candleFill;\n      var candleWidth = utils.f(stepX * candleFill, 0);\n      points.forEach(function (point, idx) {\n        if (idx > 0) {\n          var linePoints = {\n            prevPoint: points[idx - 1],\n            point: point\n          };\n\n          _this.candleBody(linePoints, {\n            candleWidth: candleWidth,\n            stepX: stepX,\n            stepY: stepY,\n            ohlc: {\n              Open: ohlcData[idx][0],\n              High: ohlcData[idx][1],\n              Low: ohlcData[idx][2],\n              Close: ohlcData[idx][3]\n            }\n          });\n        }\n      });\n    } // candle = candleBody + candleShadow\n    // return candleBody {x, y, width, height, xCenter}\n\n  }, {\n    key: \"candleBody\",\n    value: function candleBody(linePoints, storeData) {\n      // prev & current point\n      var prevPoint = linePoints.prevPoint,\n          point = linePoints.point;\n      var candleWidth = storeData.candleWidth,\n          stepX = storeData.stepX;\n      var candle = {\n        x: 0,\n        y: point[1] > prevPoint[1] ? prevPoint[1] : point[1],\n        width: candleWidth,\n        height: Math.abs(point[1] - prevPoint[1]),\n        xCenter: utils.f(point[0] - stepX / 2, 0),\n        isWin: prevPoint[1] > point[1] ? true : false\n      };\n      candle.x = utils.f(candle.xCenter - candleWidth / 2, 0);\n      this.candleShadow(linePoints, storeData, candle);\n    }\n    /**\n     * candleShadow\n     *  - top & bottom vertical line\n     * @param {Object} linePoints - line axis points\n     * @param {Object} storeData - data from store\n     * @param {Object} candle - calculated values from candleBody\n     */\n\n  }, {\n    key: \"candleShadow\",\n    value: function candleShadow(linePoints, storeData, candleBody) {\n      var prevPoint = linePoints.prevPoint;\n      var stepY = storeData.stepY,\n          _storeData$ohlc = storeData.ohlc,\n          High = _storeData$ohlc.High,\n          Low = _storeData$ohlc.Low,\n          Close = _storeData$ohlc.Close;\n      var yAxis = candleBody.y,\n          xCenter = candleBody.xCenter,\n          isWin = candleBody.isWin;\n      console.log(\"...\", High);\n      var shadow = {\n        top: [[xCenter, yAxis], [xCenter, 0]],\n        bottom: [[xCenter, prevPoint[1]], [xCenter, 0]],\n        isWin: isWin\n      }; // top line yAxis\n\n      var diffTop = utils.f((High - Close) * stepY, 0);\n      shadow.top[1][1] = yAxis - diffTop;\n      var diffBottom = utils.f((Close - Low) * stepY, 0);\n      shadow.bottom[1][1] = prevPoint[1] + diffBottom;\n\n      var candlePoint = _objectSpread({}, candleBody, {}, shadow); // store.push(\"candle.candleShadow\", shadow);\n\n\n      store.push(\"candle.points\", candlePoint);\n    }\n  }]);\n\n  return Calc;\n}();\n\nmodule.exports = Calc;\n\n//# sourceURL=webpack://Lines/./lib/calc.js?");

/***/ }),

/***/ "./lib/candle.js":
/*!***********************!*\
  !*** ./lib/candle.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("function _typeof(obj) { if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nfunction _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \"object\" || typeof call === \"function\")) { return call; } return _assertThisInitialized(self); }\n\nfunction _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return self; }\n\nfunction _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }\n\nfunction _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }\n\nvar store = __webpack_require__(/*! ./store */ \"./lib/store.js\");\n\nvar utils = __webpack_require__(/*! ./utils */ \"./lib/utils.js\");\n\nvar cfg = __webpack_require__(/*! ./config */ \"./lib/config.js\");\n\nvar Chart = __webpack_require__(/*! ./chart */ \"./lib/chart.js\");\n\nvar Candle =\n/*#__PURE__*/\nfunction (_Chart) {\n  _inherits(Candle, _Chart);\n\n  //call parent constructor\n  function Candle(elemId, calcInstance) {\n    _classCallCheck(this, Candle);\n\n    return _possibleConstructorReturn(this, _getPrototypeOf(Candle).call(this, elemId, calcInstance));\n  }\n\n  _createClass(Candle, [{\n    key: \"drawCandle\",\n    value: function drawCandle() {\n      var _this = this;\n\n      var candleBody = [],\n          candleShadow = [];\n      var candlePoints = store.get(\"points\", \"candle\");\n      candlePoints.forEach(function (cpoint) {\n        candleBody.push(utils.candle(cpoint));\n        candleShadow.push(utils.candle(cpoint, \"shadow\"));\n      }); //draw candleBody\n\n      candleBody.forEach(function (candle) {\n        var candleClass = candle.isWin ? \"wcandle\" : \"lcandle\";\n        delete candle.isWin;\n\n        _this.svgRect(candle, candleClass);\n      }); //draw candleBody\n\n      candleShadow.forEach(function (shadow) {\n        var shadowPath = _this.getPath(shadow.top[0], shadow.top[1]);\n\n        shadowPath += _this.getPath(shadow.bottom[0], shadow.bottom[1]);\n\n        _this.svgPath(shadowPath, shadow.isWin ? \"wcandle\" : \"lcandle\");\n      });\n    }\n  }]);\n\n  return Candle;\n}(Chart);\n\nmodule.exports = Candle;\n\n//# sourceURL=webpack://Lines/./lib/candle.js?");

/***/ }),

/***/ "./lib/chart.js":
/*!**********************!*\
  !*** ./lib/chart.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }\n\nfunction _nonIterableSpread() { throw new TypeError(\"Invalid attempt to spread non-iterable instance\"); }\n\nfunction _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === \"[object Arguments]\") return Array.from(iter); }\n\nfunction _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nvar store = __webpack_require__(/*! ./store */ \"./lib/store.js\");\n\nvar utils = __webpack_require__(/*! ./utils */ \"./lib/utils.js\");\n\nvar _require = __webpack_require__(/*! ./config */ \"./lib/config.js\"),\n    cfg = _require.config;\n\nvar Chart =\n/*#__PURE__*/\nfunction () {\n  function Chart(elemId, calcInstance) {\n    _classCallCheck(this, Chart);\n\n    if (!window.getComputedStyle) {\n      return;\n    }\n\n    this.el = this.getId(elemId);\n    this.snap = window.Snap(\"#\" + elemId);\n    this.calc = calcInstance;\n    this.init();\n  }\n\n  _createClass(Chart, [{\n    key: \"init\",\n    value: function init() {\n      var elemStyle = window.getComputedStyle(this.el);\n      var width = utils.f(elemStyle.width, 0);\n      var height = utils.f(elemStyle.height, 0);\n      this.area = {\n        w: width,\n        h: height,\n        width: width - cfg.chart.padding * 2,\n        height: height - cfg.chart.padding * 2,\n        endX: width - cfg.chart.padding,\n        zeroX: cfg.chart.padding,\n        zeroY: height - cfg.chart.padding,\n        offsetLeft: this.el.offsetLeft || this.el.parentElement.offsetLeft || 0,\n        offsetTop: this.el.offsetTop || this.el.parentElement.offsetTop || 0,\n        gridStep: utils.f(height / cfg.chart.totalGrids, 0) // yAxis\n\n      };\n      store.set(\"area\", this.area);\n    }\n  }, {\n    key: \"drawAxis\",\n    value: function drawAxis() {\n      this.drawLabelsX();\n      this.drawLabelsY();\n    }\n  }, {\n    key: \"drawLabelsX\",\n    value: function drawLabelsX() {\n      var _this = this;\n\n      var _store$mget = store.mget([\"labels\", \"points\"]),\n          labels = _store$mget.labels,\n          points = _store$mget.points;\n\n      var yAxis = Math.floor(this.area.zeroY + cfg.chart.padding / 2); // points & labels are same length\n\n      labels.forEach(function (labelDate, idx) {\n        var xAxis = points[idx][0];\n        var label = utils.fDate(labelDate);\n\n        _this.svgText({\n          xAxis: xAxis,\n          yAxis: yAxis,\n          label: label\n        });\n      });\n    }\n  }, {\n    key: \"drawLabelsY\",\n    value: function drawLabelsY() {\n      var _this2 = this;\n\n      var _cfg$chart = cfg.chart,\n          enableGrid = _cfg$chart.enableGrid,\n          totalGrids = _cfg$chart.totalGrids;\n      var _this$area = this.area,\n          endX = _this$area.endX,\n          gridStep = _this$area.gridStep;\n\n      var _this$calc$yAxis = this.calc.yAxis(),\n          xAxis = _this$calc$yAxis.xAxis,\n          yAxis = _this$calc$yAxis.yAxis,\n          label = _this$calc$yAxis.label,\n          labelDiff = _this$calc$yAxis.labelDiff;\n\n      var gridPath = \"\";\n\n      _toConsumableArray(Array(totalGrids)).forEach(function () {\n        console.log(\":\", label, labelDiff, gridStep);\n\n        _this2.svgText({\n          xAxis: xAxis,\n          yAxis: yAxis,\n          label: label\n        });\n\n        yAxis -= gridStep;\n        label = utils.f(label + labelDiff, 5);\n\n        if (enableGrid) {\n          gridPath += _this2.getPath([xAxis, yAxis], [endX, yAxis]);\n        }\n      });\n\n      enableGrid && this.svgPath(gridPath, cfg.cssClass.grid);\n    }\n  }, {\n    key: \"drawLine\",\n    value: function drawLine() {\n      var _store$mget2 = store.mget([\"points\", \"len\"]),\n          points = _store$mget2.points,\n          len = _store$mget2.len; // index start from 0 & ignore last point\n\n\n      var pk = 0,\n          path = \"\",\n          llen = len - 1; //toDo use while for simple loop\n\n      for (; pk < llen; pk++) {\n        path += this.getPath(points[pk], points[pk + 1]);\n        this.svgDebug(points[pk]);\n      }\n\n      this.svgPath(path);\n    }\n  }, {\n    key: \"getPath\",\n    value: function getPath(point1, point2) {\n      var path = \"M\".concat(Math.floor(point1[0]), \" \").concat(Math.floor(point1[1]));\n      path += \"L\".concat(Math.floor(point2[0]), \" \").concat(Math.floor(point2[1]));\n      return path;\n    } //if method have svg prefix depend on svg\n\n  }, {\n    key: \"svgDebug\",\n    value: function svgDebug() {\n      var points = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];\n      this.snap.circle({\n        cx: points[0],\n        cy: points[1],\n        r: 3\n      });\n    } //x,y,width,height\n\n  }, {\n    key: \"svgRect\",\n    value: function svgRect(rectData) {\n      var rectClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;\n      var rect = this.snap.rect(rectData);\n      rectClass && rect.attr({\n        \"class\": rectClass\n      });\n    }\n  }, {\n    key: \"svgText\",\n    value: function svgText(_ref) {\n      var xAxis = _ref.xAxis,\n          yAxis = _ref.yAxis,\n          label = _ref.label;\n      this.snap.text(xAxis - 5, yAxis, label);\n    }\n  }, {\n    key: \"svgPath\",\n    value: function svgPath(path) {\n      var className = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : \"stline\";\n      this.snap.path(path).attr({\n        \"class\": className\n      });\n    } // Lines.prototype.getId = function (elemID, snap = false) {\n    //   var elem;\n    //   elem = snap\n    //     ? this.snap.select(\"#\" + elemID)\n    //     : document.getElementById(elemID);\n    //   return elem || 0;\n    // };\n\n  }, {\n    key: \"getId\",\n    value: function getId(elemId) {\n      return document.getElementById(elemId);\n    }\n  }]);\n\n  return Chart;\n}();\n\nmodule.exports = Chart;\n\n//# sourceURL=webpack://Lines/./lib/chart.js?");

/***/ }),

/***/ "./lib/config.js":
/*!***********************!*\
  !*** ./lib/config.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/**\n *  EXPORT : \n *  config, { TYPES, PARTS }\n */\nvar config = {\n  animate: false,\n  zoomMove: true,\n  chart: {\n    type: [\"line\", \"candle\", \"sma\", \"ema\"],\n    padding: 30,\n    attr: {\n      stroke: \"#ddd\",\n      fill: \"none\",\n      strokeWidth: 1\n    },\n    textAttr: {\n      \"stroke-width\": \"0.1px\",\n      \"font-family\": \"Verdana\",\n      \"font-size\": \"12px\",\n      fill: \"#000\"\n    },\n    textBold: {\n      \"font-weight\": \"bold\"\n    },\n    enableGrid: true,\n    candleFill: 0.4,\n    totalGrids: 5,\n    navDot: 6,\n    // radius\n    candleFields: {\n      body: [\"x\", \"y\", \"width\", \"height\"],\n      shadow: []\n    }\n  },\n  cssClass: {\n    textLabel: \"tlabel\",\n    liveLabel: \"llabel\",\n    liveLine: \"lline\",\n    liveDot: \"ldot\",\n    winCandle: \"wcandle\",\n    loseCandle: \"lcandle\",\n    debugDot: \"ddot\",\n    line: \"stline\",\n    sma: \"stsma\",\n    ema: \"stema\",\n    grid: \"staxis\",\n    navDot: \"stnavdot\",\n    moveNavDot: \"movedot\",\n    rotateNavDot: \"rotatedot\"\n  },\n  smaLength: 5,\n  emaLength: 10,\n  magnetMode: 50,\n  step: {\n    x: 50,\n    xMin: 20,\n    xMax: 100,\n    yMax: 20,\n    arrow: 50,\n    zoom: 9,\n    offset: 9,\n    xLegend: 100\n  },\n  debug: {\n    radius: 6,\n    attr: {\n      stroke: \"red\"\n    }\n  },\n  timeUnit: \"15m\",\n  timeUnits: [\"15m\", \"30m\", \"1h\", \"4h\", \"1d\", \"1w\"],\n  //supported TIME UNITS\n  drawOrder: [\"drawLine\", \"drawCandle\", \"drawSMA\", \"drawEMA\"]\n}; // chart SVG \n\nvar SVG = {\n  line: \"line\",\n  text: \"text\",\n  rect: \"rect\",\n  circle: \"circle\",\n  path: \"path\",\n  input: \"input\"\n}; // // chart Parts\n\nvar PART = {\n  axis: \"axis\",\n  line: \"line\",\n  candle: \"candle\",\n  legend: \"legend\",\n  debug: \"debug\",\n  sinit: \"sinit\",\n  init: \"init\",\n  sma: \"sma\",\n  ema: \"ema\"\n};\nmodule.exports = {\n  config: config,\n  SVG: SVG,\n  PART: PART\n};\n\n//# sourceURL=webpack://Lines/./lib/config.js?");

/***/ }),

/***/ "./lib/index.js":
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var store = __webpack_require__(/*! ./store */ \"./lib/store.js\");\n\nvar Calc = __webpack_require__(/*! ./calc */ \"./lib/calc.js\");\n\nvar Candle = __webpack_require__(/*! ./candle */ \"./lib/candle.js\");\n\nvar _require = __webpack_require__(/*! ./config */ \"./lib/config.js\"),\n    PART = _require.PART;\n\nwindow.cl = console.log;\n/**\n * Only public methods here\n *  - everething else should be splited into other files\n *  - store.js - GLOBAL STORE\n *  - calc.js - calculation \n *  - chart.js - SVG line layer\n *  - candle.js - SVG candle layer\n *  - config.js - configuration\n */\n\nvar Lines = function () {\n  var Lines = function Lines(elemId) {\n    if (!window.Snap) {\n      throw new Error(\"Missing Snap.svg library !\");\n    }\n\n    this.calc = new Calc(); // cbase > line > candle > sma > ema > chart \n    // chart > candle > sma > ema\n    // pass instance of calc to chart ...\n\n    this.chart = new Candle(elemId, this.calc);\n  };\n  /**\n   * public Method\n   *  - save data into store ...\n   * @param {Array} chartData\n   */\n\n\n  Lines.prototype.data = function (chartData) {\n    if (!(chartData instanceof Array)) {\n      throw new Error(\"Missing library  data !\");\n    }\n\n    store.save(chartData);\n    this.calc.start(); // lines ... candles ...\n\n    this.calc.main();\n  };\n  /*\n                        _                            _   _               _     \n     _ __ ___ _ __   __| | ___ _ __   _ __ ___   ___| |_| |__   ___   __| |___ \n    | '__/ _ \\ '_ \\ / _` |/ _ \\ '__| | '_ ` _ \\ / _ \\ __| '_ \\ / _ \\ / _` / __|\n    | | |  __/ | | | (_| |  __/ |    | | | | | |  __/ |_| | | | (_) | (_| \\__ \\\n    |_|  \\___|_| |_|\\__,_|\\___|_|    |_| |_| |_|\\___|\\__|_| |_|\\___/ \\__,_|___/\n  */\n\n\n  Lines.prototype.draw = function (drawType) {\n    switch (drawType) {\n      case PART.axis:\n        this.chart.drawAxis();\n        break;\n\n      case PART.line:\n        this.chart.drawLine();\n        break;\n\n      case PART.candle:\n        this.chart.drawCandle();\n        break;\n    }\n  };\n\n  return Lines;\n}();\n\nif ( true && typeof module.exports !== \"undefined\") {\n  module.exports = Lines;\n} else {\n  window.Lines = Lines;\n}\n\n//# sourceURL=webpack://Lines/./lib/index.js?");

/***/ }),

/***/ "./lib/store.js":
/*!**********************!*\
  !*** ./lib/store.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); }\n\nfunction _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === \"[object Arguments]\")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\nfunction ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }\n\nfunction _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\nvar store = {}; // internal STORE\n\nvar _store = {\n  // raw: [],\n  // labels: [],\n  // data: [],\n  line: {},\n  candle: {},\n  ema: {},\n  sma: {}\n};\n\nvar _blank = _objectSpread({}, _store);\n\nstore.save = function (saveData) {\n  var scope = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : \"line\";\n  var validData = store.validate(saveData) ? saveData : store.dataFormatter(saveData);\n  store.mset({\n    raw: validData,\n    labels: validData.map(function (item) {\n      return item[4];\n    }),\n    data: validData.map(function (item) {\n      return item[3];\n    })\n  });\n}; //toDO remove this ...\n\n\nstore.all = function () {\n  return _store;\n}; //getter\n\n\nstore.get = function (getProp) {\n  var scope = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : \"line\";\n  return _store[scope][getProp];\n}; //multi getter\n\n\nstore.mget = function (getProps) {\n  var scope = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : \"line\";\n  var _data = {};\n  getProps.forEach(function (prop) {\n    _data[prop] = _store[scope][prop];\n  });\n  return _data;\n}; // check and init\n// candle.points = level1 candle & level2 points\n\n\nstore.init = function (prop) {\n  var _prop$split = prop.split(\".\"),\n      _prop$split2 = _slicedToArray(_prop$split, 2),\n      level1 = _prop$split2[0],\n      level2 = _prop$split2[1];\n\n  if (level2) {\n    !_store[level1] && (_store[level1] = {});\n    !_store[level1][level2] && (_store[level1][level2] = []);\n  } else {\n    !_store[level1] && (_store[level1] = []);\n  }\n\n  return level2 ? [level1, level2] : [level1];\n}; // push to array\n// chart.property - level1 chart & level2 propery\n\n\nstore.push = function (pushProp, pushData) {\n  var levels = store.init(pushProp);\n\n  if (levels[1]) {\n    _store[levels[0]][levels[1]].push(pushData);\n  } else {\n    _store[levels[0]].push(pushData);\n  }\n}; // setter\n\n\nstore.set = function (setProp, setData) {\n  var scope = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : \"line\";\n  _store[scope][setProp] = setData;\n}; // multi setter - {prop1: prop1_value, prop2: pro2_value}\n\n\nstore.mset = function (setData) {\n  var scope = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : \"line\";\n  _store[scope] = _objectSpread({}, _store[scope], {}, setData);\n}; // store config get ... ???\n\n/**\n * check if all array members have date & high properties\n * array.every - return boolean ( true | false )\n */\n\n\nstore.validate = function (dataArray) {\n  return dataArray.every(function (item) {\n    return !item.date || !item.high;\n  });\n};\n\nstore.dataFormatter = function (rawData) {\n  return rawData.map(function (row) {\n    return [row.open, row.high, row.low, row.close, row.date];\n  });\n};\n\nstore.reset = function () {\n  _store = _objectSpread({}, _blank);\n};\n\nmodule.exports = _objectSpread({}, store);\n\n//# sourceURL=webpack://Lines/./lib/store.js?");

/***/ }),

/***/ "./lib/utils.js":
/*!**********************!*\
  !*** ./lib/utils.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }\n\nfunction _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\nmodule.exports = function () {\n  var utils = {}; //formater\n\n  utils.f = function (_number) {\n    var fixDigit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;\n    return Math.abs(parseFloat(_number).toFixed(fixDigit));\n  };\n\n  utils.fDate = function (timeStamp) {\n    var period = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : \"15m\";\n    var date = new Date(timeStamp); // (\"3123\" + d.getMinutes()).slice(-4)\n\n    if (period === \"15m\") {\n      return date.getHours() + \":\" + date.getMinutes();\n    }\n  };\n\n  utils.candle = function (candlePoint) {\n    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : \"body\";\n    var allowedFields = {\n      body: [\"x\", \"y\", \"width\", \"height\", \"isWin\"],\n      shadow: [\"top\", \"bottom\", \"isWin\"]\n    };\n    return Object.keys(candlePoint).filter(function (key) {\n      return allowedFields[type].includes(key);\n    }).reduce(function (obj, key) {\n      obj[key] = candlePoint[key];\n      return obj;\n    }, {});\n  };\n\n  return _objectSpread({}, utils);\n}();\n\n//# sourceURL=webpack://Lines/./lib/utils.js?");

/***/ })

/******/ });
});