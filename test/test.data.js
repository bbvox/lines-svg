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
      [410, 150],
      [530, 550]
    ],
    expectedYAxis: {
      xAxis: 50,
      yAxis: 550,
      label: 1,
      labelDiff: 0.111
    }
  },
  chart: {
    noop: () => { },
    html: "<svg id='svgId'></svg>",
    elemId: "svgId",
    computedStyle: {
      width: 100,
      height: 200
    },
    expectedSvgText: {
      argumentsLabelX: [
        { xAxis: 30, yAxis: 185, label: '4:0' },
        { xAxis: 38, yAxis: 185, label: '4:15' },
        { xAxis: 46, yAxis: 185, label: '3:45' },
        { xAxis: 54, yAxis: 185, label: '3:45' },
        { xAxis: 62, yAxis: 185, label: '3:45' }
      ],
      argumentsLabelXUTC: [
        { xAxis: 30, yAxis: 185, label: '2:0' },
        { xAxis: 38, yAxis: 185, label: '2:15' },
        { xAxis: 46, yAxis: 185, label: '1:45' },
        { xAxis: 54, yAxis: 185, label: '1:45' },
        { xAxis: 62, yAxis: 185, label: '1:45' }
      ],
      argumentsLabelY: [
        { xAxis: 30, yAxis: 170, label: 1 },
        { xAxis: 30, yAxis: 142, label: 1.111 },
        { xAxis: 30, yAxis: 114, label: 1.222 },
        { xAxis: 30, yAxis: 86, label: 1.333 },
        { xAxis: 30, yAxis: 58, label: 1.444 }
      ]
    },
    expectedDebugArguments: [
      [30, 86],
      [38, 142],
      [46, 30],
      [54, 30]
    ]
  }
}