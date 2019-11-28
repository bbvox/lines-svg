module.exports = {
  utils: {
    input: 1.2345678,
    expected: 1.23457,
    expected2: 1,
    inputTimestamp: 1574897266392,
    expectedDate: '1:27'
  },
  store: {
    input: [
      [1.111, 1.333, 1.111, 1.333, 1515031200222],
      [1.333, 1.333, 1.111, 1.111, 1515032100111],
      [1.333, 1.555, 1.333, 1.555, 1515030300333]
    ],
    expectedData: [1.333, 1.111, 1.555],
    expectedLabels: [1515031200222, 1515032100111, 1515030300333],
    inputPush: [1, 2],
    expectedPush: [1, 2],
    setter: 1.2233
  },
  calc: {
    initMin: 1.111,
    initMax: 1.555,
    initAmplitude: 0.444
  }
}