const store = require("./store");
const utils = require("./utils");

const { config: cfg } = require("./config");

const CalcBase = require('./calc-base');

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

  // find line slope between two points
  // slope = (y2 - y1) / (x2 - x1);
  // b = y1 - (slope * x1);
  findY(x) {
    const points = store.get("points", "line");
  }
}

module.exports = Calc;
