module.exports = {
  utils: {
    input: 1.2345678,
    expected: 1.23457,
    expected2: 1,
    inputTimestamp: 1575000000000,
    expectedTime: { hour: 6, hourUtc: 4, min: 0 }
  },
  store: {
    input: [
      [1.111, 1.333, 1.111, 1.333, 1515031200222],
      [1.333, 1.333, 1.111, 1.111, 1515032100111],
      [1.333, 1.555, 1.333, 1.555, 1515030300333],
      [1.555, 1.555, 1.555, 1.555, 1515030300444],
      [1.555, 1.555, 1, 1, 1515030300555]
    ],
    inputUnformatted: [
      { open: 1.111, high: 1.333, low: 1.111, close: 1.333, date: 1515031200222 }
    ],
    expectedFormatted: [
      [1.111, 1.333, 1.111, 1.333, 1515031200222]
    ],
    expectedData: [1.333, 1.111, 1.555, 1.555, 1],
    expectedLabels: [1515031200222, 1515032100111, 1515030300333, 1515030300444, 1515030300555],
    inputPush: [1, 2],
    expectedPush: [1, 2],
    setter: 1.2233,
    inputArea: {
      width: 600,
      height: 400,
      zeroX: 50,
      zeroY: 550,
    }
  },
  calc: {
    initMin: 1,
    initMax: 1.555,
    initAmplitude: 0.555,
    expectedSteps: {
      stepX: 120,
      stepY: 721,
      zeroX: 50,
      zeroY: 310
    },
    expectedPoints: [
      [50, 310],
      [170, 470],
      [290, 150],
      [410, 1121],
      [530, 1521]
    ],
    expectedYAxis: {
      xAxis: 50,
      yAxis: 550,
      label: 1,
      labelDiff: 0.111
    }
  }
}