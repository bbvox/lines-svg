const store = {};

// internal STORE
let _store = {
  raw: [],
  labels: [],
  data: []
};

const _blank = {
  ..._store
};

store.save = saveData => {
  const validData = store.validate(saveData)
    ? saveData
    : store.dataFormatter(saveData);

  store.mset({
    raw: validData,
    labels: validData.map(item => item[4]),
    data: validData.map(item => item[3])
  });
};

//toDO remove this ...
store.all = () => _store;

//getter
store.get = getProp => _store[getProp];

//multi getter
store.mget = getProps => {
  let _data = {};

  getProps.forEach(prop => {
    _data[prop] = _store[prop];
  });
  return _data;
}

// check and init
// candle.points = level1 candle & level2 points
store.init = (prop) => {
  const [level1, level2] = prop.split(".");

  if (level2) {
    !_store[level1] && (_store[level1] = {});
    !_store[level1][level2] &&
      (_store[level1][level2] = []);
  } else {
    !_store[level1] && (_store[level1] = []);
  }
  return level2 ? [level1, level2] : [level1];
}

// push to array
// chart.property - level1 chart & level2 propery
store.push = (pushProp, pushData) => {
  const levels = store.init(pushProp);

  if (levels[1]) {
    _store[levels[0]][levels[1]].push(pushData);
  } else {
    _store[levels[0]].push(pushData);
  }
}

// setter
store.set = (setProp, setData) => {
  _store[setProp] = setData;
};

// multi setter - {prop1: prop1_value, prop2: pro2_value}
store.mset = setData => {
  _store = {
    ..._store,
    ...setData
  };
};

// store config get ... ???

/**
 * check if all array members have date & high properties
 * array.every - return boolean ( true | false )
 */
store.validate = dataArray =>
  dataArray.every(item => !item.date || !item.high);

store.dataFormatter = rawData =>
  rawData.map(row => [row.open, row.high, row.low, row.close, row.date]);

store.reset = () => {
  _store = {
    ..._blank
  }
}

module.exports = {
  ...store
}
