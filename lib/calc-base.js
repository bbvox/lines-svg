const store = require("./store");
const utils = require("./utils");

const { config: cfg } = require("./config");

class CalcBase {
  start() {
    this.init();
    this.initSteps();
  }

  main() {
    this.lines();
    this.candle();
    this.sma();
    this.ema();
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
      zero: first[3],
    };

    ohlcData.forEach((item) => {
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
    console.log(store.all());
    const init = {
      len: data.length,
      min: data[0],
      max: data[0],
      amplitude: 0,
      zero: data[0],
    };
    data.forEach((item) => {
      if (init.min > item) init.min = item;
      if (init.max < item) init.max = item;
    });
    init.amplitude = utils.f(init.max - init.min);
    this.save(init);
  }

  // stepX, stepY, zeroX & zeroY
  initSteps() {
    const { area, amplitude, len, zero, min } = store.mget([
      "area",
      "amplitude",
      "len",
      "zero",
      "min",
    ]);
    let [stepX, stepY, zeroX, zeroY] = [0, 0, 0, 0];
    stepX = utils.f(area.width / len, 0);
    stepY = utils.f(area.height / amplitude, 0);
    zeroX = area.zeroX;
    zeroY = utils.f(area.zeroY - (zero - min) * stepY, 0);

    this.save({ stepX, stepY, zeroX, zeroY });
  }

  lines() {
    const data = store.get("data");
    store.set("points", this.dataToPoints(data), "line");
  }

  /**
   * dataToPoints
   *  - convert values to axis Points
   * @param {Array} dataArray - array of digit values
   * @example [1.23, 1.47, 1.3] => [[30,360], [90, 300], [150, 320]]
   * @returns {Array} points - axis points
   */
  dataToPoints(dataArray = []) {
    const { stepX, stepY, zeroX, zeroY } = store.mget([
      "stepX",
      "stepY",
      "zeroX",
      "zeroY",
    ]);

    let prev = { data: dataArray[0], point: [zeroX, zeroY] };

    return dataArray.map((data, k) => {
      if (!k) {
        return prev.point; // point 0
      }
      // can be negative
      const diff = (data - prev.data) * stepY;
      // [ xAxis, yAxis ]
      const point = [prev.point[0] + stepX, utils.f(prev.point[1] - diff, 0)];
      prev = { data, point };
      return point;
    });
  }

  yAxis() {
    const { amplitude, area, min } = store.mget(["amplitude", "area", "min"]);
    const { totalGrids } = cfg.chart;
    const labelDiff = utils.f(amplitude * (1 / totalGrids), 7);

    return {
      xAxis: area.zeroX,
      yAxis: area.zeroY,
      label: min,
      labelDiff,
    };
  }

  // split into categories ... lines, candles, smas, emas ...
  save(storeData, type = "line") {
    if (typeof storeData === "object") {
      store.mset(storeData);
    }
  }

  candle() {
    const { stepX, stepY, raw: ohlcData } = store.mget([
      "stepX",
      "stepY",
      "raw",
    ]);
    const points = store.get("points", "line");
    const { candleFill } = cfg.chart;
    const candleWidth = utils.f(stepX * candleFill, 0);
    points.forEach((point, idx) => {
      if (idx > 0) {
        const linePoints = {
          prevPoint: points[idx - 1],
          point,
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
          },
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
      y: point[1] > prevPoint[1] ? prevPoint[1] : point[1],
      width: candleWidth,
      height: Math.abs(point[1] - prevPoint[1]),
      xCenter: utils.f(point[0] - stepX / 2, 0),
      isWin: prevPoint[1] > point[1] ? true : false,
    };
    candle.x = utils.f(candle.xCenter - candleWidth / 2, 0);

    this.candleShadow(linePoints, storeData, candle);
  }

  /**
   * candleShadow
   *  - top & bottom vertical line
   * @param {Object} linePoints - line axis points
   * @param {Object} storeData - data from store
   * @param {Object} candleBody - calculated values from candleBody
   */
  candleShadow(linePoints, storeData, candleBody) {
    const { prevPoint, point } = linePoints;
    const {
      stepY,
      ohlc: { Open, High, Low, Close },
    } = storeData;
    const { y: yAxis, xCenter, isWin } = candleBody;
    const shadow = {
      top: [
        [xCenter, yAxis],
        [xCenter, yAxis],
      ],
      bottom: [
        [xCenter, prevPoint[1]],
        [xCenter, prevPoint[1]],
      ],
      isWin,
    };

    let diffTop, diffBot;
    if (isWin) {
      diffTop = High - Close;
      diffBot = Open - Low;
    } else {
      diffTop = High - Open;
      diffBot = Close - Low;
      //change both yAxis !!!
      shadow.bottom[0][1] = point[1];
      shadow.bottom[1][1] = point[1];
    }

    shadow.top[1][1] -= utils.f(diffTop * stepY, 0);
    shadow.bottom[1][1] += utils.f(diffBot * stepY, 0);

    store.push("candle.points", {
      ...candleBody,
      ...shadow,
    });
  }
}

module.exports = CalcBase;
