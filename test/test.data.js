module.exports = {
  utils: {
    input: 1.2345678,
    expected: 1.23457,
    expected2: 1,
    inputTimestamp: 1575000000000,
    expectedTime: { hour: 6, min: 0 },
  },
  store: {
    input: [
      [1.111, 1.333, 1.111, 1.333, 1515031200222],
      [1.333, 1.333, 1.111, 1.111, 1515032100111],
      [1.333, 1.555, 1.333, 1.555, 1515030300333],
      [1.555, 1.555, 1.555, 1.555, 1515030300444],
      [1.555, 1.555, 1, 1, 1515030300555],
    ],
    inputUnformatted: [
      {
        open: 1.111,
        high: 1.333,
        low: 1.111,
        close: 1.333,
        date: 1515031200222,
      },
    ],
    expectedFormatted: [[1.111, 1.333, 1.111, 1.333, 1515031200222]],
    expectedData: [1.333, 1.111, 1.555, 1.555, 1],
    expectedLabels: [
      1515031200222,
      1515032100111,
      1515030300333,
      1515030300444,
      1515030300555,
    ],
    inputPush: [1, 2],
    expectedPush: [1, 2],
    setter: 1.2233,
    inputArea: {
      width: 600,
      height: 400,
      zeroX: 50,
      zeroY: 550,
      ordinateX: 25
    },
  },
  calc: {
    initMin: 1,
    initMax: 1.555,
    initAmplitude: 0.555,
    expectedSteps: {
      stepX: 120,
      stepY: 721,
      zeroX: 100,
      zeroY: 310,
    },
    expectedPoints: [
      [100, 310],
      [220, 470],
      [340, 150],
      [460, 150],
      [580, 550],
    ],
    expectedYAxis: {
      point: [25, 550],
      label: 1,
      labelDiff: 0.111,
    },
  },
  chart: {
    noop: () => {},
    html: "<svg id='svgId'></svg>",
    elemId: "svgId",
    computedStyle: {
      width: 100,
      height: 200,
    },
    expectedSvgText: {
      argumentsLabelX: [
        { point: [60, 185], label: "4:0", groupFlag: true },
        { point: [68, 185], label: "4:15", groupFlag: true },
        { point: [76, 185], label: "3:45", groupFlag: true },
        { point: [84, 185], label: "3:45", groupFlag: true },
        { point: [92, 185], label: "3:45", groupFlag: true },
      ],
      argumentsLabelY: [
        { point: [15, 170], label: 1 },
        { point: [15, 142], label: 1.111 },
        { point: [15, 114], label: 1.222 },
        { point: [15, 86], label: 1.333 },
        { point: [15, 58], label: 1.444 },
      ],
    },
    expectedDebugArguments: [
      [60, 86],
      [68, 142],
      [76, 30],
      [84, 30],
    ],
  },
};
