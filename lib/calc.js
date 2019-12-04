const store = require("./store");
const utils = require("./utils");

const { config: cfg } = require("./config");

class Calc {
  start() {
    this.init();
    this.initSteps();
  }

  // min, max & attitude
  // toDo if candle is set check whole data 
  // else use init2 only with close value
  init() {
    const ohlcData = store.get("raw");
    const first = [...ohlcData[0]];
    first.pop();
    const init = {
      len: ohlcData.length,
      min: Math.min(...first),
      max: Math.max(...first),
      amplitude: 0,
      zero: first[3]
    };

    ohlcData.forEach(item => {
      //get min from low or close
      if (init.min > item[2]) init.min = item[2];
      if (init.min > item[3]) init.min = item[3];

      //get max from high or close
      if (init.max < item[1]) init.max = item[1];
      if (init.max < item[3]) init.max = item[3];
    });


    init.amplitude = utils.f(init.max - init.min);
    this.save(init);
  }

  // min, max & attitude
  init2() {
    const data = store.get("data");
    console.log(store.all())
    const init = {
      len: data.length,
      min: data[0],
      max: data[0],
      amplitude: 0,
      zero: data[0]
    };
    data.forEach(item => {
      if (init.min > item) init.min = item;
      if (init.max < item) init.max = item;
    });
    init.amplitude = utils.f(init.max - init.min);
    this.save(init);
  }

  // stepX, stepY, zeroX & zeroY
  initSteps() {
    const { area, amplitude, len, zero, min } =
      store.mget(["area", "amplitude", "len", "zero", "min"]);
    let [stepX, stepY, zeroX, zeroY] = [0, 0, 0, 0];
    stepX = utils.f(area.width / len, 0);
    stepY = utils.f(area.height / amplitude, 0);
    zeroX = area.zeroX;
    zeroY = utils.f(area.zeroY - ((zero - min) * stepY), 0);

    this.save({ stepX, stepY, zeroX, zeroY });
  }

  // CALCULATE LINE CHART AXIS POINTS //////////
  // calculate axis points and store it into line.points - points
  // pointOne = [axisX, axisY]
  // this.TYPE.points = [[x0,y0], [x1, y1].....[x88,y88]]
  // main -> calcPoint -> point
  main() {
    this.lines();
    this.candle();
  }

  lines() {
    const { data, zeroX, zeroY, len } = store.mget(["data", "zeroX", "zeroY", "len"]);
    const { stepX, stepY } = store.mget(["stepX", "stepY"]);

    store.push("line.points", [zeroX, zeroY]); // point ONE
    this.tmp = {
      data,
      stepX,
      stepY,
      lastX: zeroX,
      lastY: zeroY
    };

    for (let pIndex = 1; pIndex < len; pIndex++) {
      (this.calcPoint)(pIndex);
    }
  }

  // walk through whole data Array
  calcPoint(dataIndex) {
    const prev = this.tmp.data[dataIndex - 1];
    const current = this.tmp.data[dataIndex];

    if (current < prev) {
      this.point((prev - current), "plus");
    } else if (current > prev) {
      this.point((current - prev), "minus");
    } else {
      this.point(0, "equal");
    }
  }

  //calc next point
  point(diff, type) {
    let nextY;
    const nextX = this.tmp.lastX + this.tmp.stepX;
    const diffY = diff * this.tmp.stepY;

    nextY = this.tmp.lastY;
    if (type === "plus") {
      nextY += diffY;
    } else if (type === "minus") {
      nextY -= diffY;
    }
    // equal nextY same as previous one
    store.push("line.points", [utils.f(nextX, 0), utils.f(nextY, 0)]);
    this.tmp.lastX = nextX;
    this.tmp.lastY = nextY;
  }

  yAxis() {
    const { amplitude, area, min } = store.mget(["amplitude", "area", "min"]);
    const { totalGrids } = cfg.chart;
    const labelDiff = utils.f(amplitude * (1 / totalGrids), 7);

    return {
      xAxis: area.zeroX,
      yAxis: area.zeroY,
      label: min,
      labelDiff
    }
  }

  // split into categories ... lines, candles, smas, emas ...
  save(storeData, type = "line") {
    if (typeof storeData === "object") {
      store.mset(storeData);
    }
  }

  // CANDLE - candleStick
  candle() {
    const { points, stepX, stepY, raw: ohlcData } =
      store.mget(["points", "stepX", "stepY", "raw"]);
    const { candleFill } = cfg.chart;
    const candleWidth = utils.f(stepX * candleFill, 0);
    points.forEach((point, idx) => {
      if (idx > 0) {
        const linePoints = {
          prevPoint: points[idx - 1],
          point
        };
        this.candleBody(linePoints, {
          candleWidth,
          stepX,
          stepY,
          ohlc: {
            Open: ohlcData[idx][0],
            High: ohlcData[idx][1],
            Low: ohlcData[idx][2],
            Close: ohlcData[idx][3],
          }
        });
      }
    });
  }

  // candle = candleBody + candleShadow
  // return candleBody {x, y, width, height, xCenter}
  candleBody(linePoints, storeData) {
    // prev & current point
    const { prevPoint, point } = linePoints;
    const { candleWidth, stepX } = storeData;

    const candle = {
      x: 0,
      y: (point[1] > prevPoint[1] ? prevPoint[1] : point[1]),
      width: candleWidth,
      height: Math.abs(point[1] - prevPoint[1]),
      xCenter: utils.f(point[0] - (stepX / 2), 0),
      isWin: (prevPoint[1] > point[1]) ? true : false
    };
    candle.x = utils.f(candle.xCenter - (candleWidth / 2), 0);

    this.candleShadow(linePoints, storeData, candle);
  }

  /**
   * candleShadow
   *  - top & bottom vertical line
   * @param {Object} linePoints - line axis points
   * @param {Object} storeData - data from store
   * @param {Object} candle - calculated values from candleBody
   */
  candleShadow(linePoints, storeData, candleBody) {
    const { prevPoint } = linePoints;
    const { stepY, ohlc: { High, Low, Close } } = storeData;
    const { y: yAxis, xCenter, isWin } = candleBody;
    const shadow = {
      top: [[xCenter, yAxis], [xCenter, 0]],
      bottom: [[xCenter, prevPoint[1]], [xCenter, 0]],
      isWin
    };
    // top line yAxis
    const diffTop = utils.f((High - Close) * stepY, 0);
    shadow.top[1][1] = yAxis - diffTop;

    const diffBottom = utils.f((Close - Low) * stepY, 0);
    shadow.bottom[1][1] = prevPoint[1] + diffBottom;

    const candlePoint = {
      ...candleBody,
      ...shadow
    };

    // store.push("candle.candleShadow", shadow);
    store.push("candle.points", candlePoint);
  }
}

module.exports = Calc;
