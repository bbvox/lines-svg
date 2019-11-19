import store from "./store";
import utils from "./utils";

import cfg, { SVG, PART } from "./config";

class Calc {
  // instead of constructor
  start() {
    this.init();
    this.initSteps();
  }

  // min, max & attitude
  init() {
    const data = store.get("data");
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
  // calculate axis points and store it into lines.points
  // pointOne = [axisX, axisY]
  // this.TYPE.points = [[x0,y0], [x1, y1].....[x88,y88]]
  // main -> calcPoint -> nextPoint
  main() {
    const { data, zeroX, zeroY, len } = store.mget(["data", "zeroX", "zeroY", "len"]);
    const { stepX, stepY } = store.mget(["stepX", "stepY"]);

    store.push("points", [zeroX, zeroY]); // point ONE
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
      this.nextPoint((prev - current), "plus");
    } else if (current > prev) {
      this.nextPoint((current - prev), "minus");
    } else {
      this.nextPoint(current, "equal");
    }
  }

  //calc next point
  nextPoint(diff, type) {
    let nextX, nextY, diffY;

    nextX = this.tmp.lastX + this.tmp.stepX;

    diffY = diff * this.tmp.stepY;
    nextY = this.tmp.lastY;
    if (type === "plus") {
      nextY += diffY;
    } else if (type === "minus") {
      nextY -= diffY;
    } else if (type === "equal") {
      nextY = diffY;
    }

    store.push("points", [nextX, nextY]);
    this.tmp.lastX = nextX;
    this.tmp.lastY = nextY;
  }

  yAxis() {
    const { amplitude, area, min } = store.mget(["amplitude", "area", "min"]);
    const { totalGrids } = cfg.chart;

    const labelDiff = utils.f(amplitude * (1 / totalGrids), 4);

    return {
      xAxis: area.zeroX,
      yAxis: area.zeroY,
      label: min,
      labelDiff
    }
  }

  // split into categories ... line, candle, sma, ema ...
  save(storeData, type = "line") {
    if (typeof storeData === "object") {
      store.mset(storeData);
    } else {
      store.set();
    }
  }

  candleWidth() {
    const stepX = store.get("stepX");
    const { candleFill } = cfg.chart;
    const candleWidth = stepX * cfg.chart.candleFill;
    console.log("..", stepX, candleFill)
    store.set("candleWidth", (stepX * candleFill));
  }
}

export default Calc;
