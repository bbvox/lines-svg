const _blank = {
  init: {},
  line: {},
  candle: {},
  ema: {},
  sma: {},
  _live: {},
  set live(liveVal) {
    this._live = liveVal;
  },
  get live() {
    return this._live;
  },
};

// internal STORE
let _store = JSON.parse(JSON.stringify(_blank));

const store = {};

store.save = (saveData, scope = "line") => {
  const validData = store.validate(saveData)
    ? saveData
    : store.dataFormatter(saveData);

  store.mset({
    raw: validData,
    labels: validData.map((item) => item[4]),
    data: validData.map((item) => item[3]),
  });

  // redundant data because it is present into init
  store.set(
    "data",
    validData.map((item) => item[3]),
    "line"
  );
};

//toDO remove this ...
store.all = () => _store;

//getter
store.get = (getProp, scope = "init") => _store[scope][getProp];

//multi getter
store.mget = (getProps, scope = "init") => {
  let _data = {};

  getProps.forEach((prop) => {
    _data[prop] = _store[scope][prop];
  });
  return _data;
};

// check and init
// candle.points = level1 candle & level2 points
store.init = (prop) => {
  const [level1, level2] = prop.split(".");

  if (level2) {
    !_store[level1] && (_store[level1] = {});
    !_store[level1][level2] && (_store[level1][level2] = []);
  } else {
    !_store[level1] && (_store[level1] = []);
  }
  return level2 ? [level1, level2] : [level1];
};

// push to array
// chart.property - level1 chart & level2 propery
store.push = (pushProp, pushData) => {
  const levels = store.init(pushProp);

  if (levels[1]) {
    _store[levels[0]][levels[1]].push(pushData);
  } else {
    _store[levels[0]].push(pushData);
  }
};

// setter
store.set = (setProp, setData, scope = "init") => {
  _store[scope][setProp] = setData;
};

// multi setter - {prop1: prop1_value, prop2: pro2_value}
store.mset = (setData, scope = "init") => {
  _store[scope] = {
    ..._store[scope],
    ...setData,
  };
};

/**
 * check if all array members have date & high properties
 * array.every - return boolean ( true | false )
 */
store.validate = (dataArray) =>
  dataArray.every((item) => !item.date || !item.high);

store.dataFormatter = (rawData) =>
  rawData.map((row) => [row.open, row.high, row.low, row.close, row.date]);

store.reset = () => {
  _store = {
    ..._blank,
  };
};

module.exports = store;
