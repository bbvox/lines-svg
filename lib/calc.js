const store = require("./store");
const utils = require("./utils");

const CalcBase = require("./calc-base");

class Calc extends CalcBase {
  //move in separate file - sma + ema...
  // SMA = (A1 + A2 + ... An) / n
  // 1 + 2 + 3 + 4 + 5 / 5
  sma(smaLen = 2) {
    const data = store.get("data");
    const smaData = this.calcSma(data, smaLen);
    store.mset(
      {
        data: smaData,
        points: this.dataToPoints(smaData),
      },
      "sma"
    );
  }

  // return sma data
  calcSma(dataArray, smaLen) {
    let total = 0;

    return dataArray.map((d, idx) => {
      ++idx; // start from 1 not 0
      total += d; // increase

      if (idx > smaLen) {
        total -= dataArray[idx - 1 - smaLen]; // decrease
      }

      return idx < smaLen ? d : utils.f(total / smaLen);
    });
  }

  ema(emaLen = 2) {
    const data = store.get("data");

    const emaData = this.calcEma(data, emaLen);

    store.mset(
      {
        data: emaData,
        points: this.dataToPoints(emaData),
      },
      "ema"
    );
  }

  // EMA(today) = Price(today) * K + EMA(yesterday) * (1-K)
  // EMAtoday = Ptoday * k + EMAyest * k2
  // K = 2 / (length + 1)
  calcEma(dataArray, emaLen) {
    const k = 2 / (emaLen + 1);
    const k2 = 1 - k;

    let prev = dataArray[0];
    return dataArray.map((d, idx) => {
      if (!idx) return d;

      const edata = d * k + prev * k2;
      prev = d;
      return utils.f(edata);
    });
  }

  findY(x) {
    const foundYPixel = this.findYpixel(x);
    if (!foundYPixel) {
      return false;
    }
    const { zeroY, stepY, minClose, area } = store.mget([
      "zeroY",
      "stepY",
      "minClose",
      "area",
    ]);
    // const yValue = minClose + (zeroY - foundYPixel) / stepY;
    const yValue = minClose + (area.zeroY - foundYPixel) / stepY;

    return {
      pixel: utils.f(foundYPixel, 0),
      value: utils.f(yValue),
    };
  }

  // find line slope between two points
  // slope = (y2 - y1) / (x2 - x1);
  // b = y1 - (slope * x1);
  findYpixel(xValue) {
    const points = store.get("points", "line");
    const pointIdx = points.findIndex((point) => point[0] > xValue);
    if (!pointIdx || pointIdx < 1) {
      return;
    }
    const [point1, point2] = [points[pointIdx - 1], points[pointIdx]];
    const slope = (point2[1] - point1[1]) / (point2[0] - point1[0]);
    const b = point1[1] - slope * point1[0];

    return slope * xValue + b;
  }

  liveRect(point, dataRect) {
    if (!dataRect) {
      return {
        x: point[0],
        y: point[1],
        width: 0,
        height: 0,
      };
    }

    const rdata = {};

    if (point[0] > dataRect.x) {
      rdata.width = point[0] - dataRect.x;
    } else {
      rdata.width = dataRect.x - point[0];
      rdata.x = point[0];
    }

    if (point[1] > dataRect.y) {
      rdata.height = point[1] - dataRect.y;
    } else {
      rdata.height = dataRect.y - point[1];
      rdata.y = point[1];
    }

    return rdata;
  }

  liveCircle(point, dataCircle) {
    const rx = Math.abs(dataCircle[0] - point[0]);
    const ry = Math.abs(dataCircle[1] - point[1]);
    return { r: rx > ry ? rx : ry };
  }

  livePointer(point) {
    const foundY = this.findY(point[0]);
    return {
      x1: point[0],
      x2: point[0],
      y1: foundY.pixel,
      y2: point[1],
      foundY,
    };
  }
}

module.exports = Calc;
