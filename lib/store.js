const store = {};

// internal STORE
let _store = {
  raw: [],
  labels: [],
  data: []
};

store.save = saveData => {
  const validData = store.validate(saveData)
    ? saveData
    : store.dataFormater(saveData);

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

// push to array
store.push = (pushProp, pushData) => {
  if (!_store[pushProp]) {
    _store[pushProp] = [];
  }
  _store[pushProp].push(pushData);
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

/**
 * check if all array members have date & high properties
 * array.every - return boolean ( true | false )
 */
store.validate = dataArray =>
  dataArray.every(item => !item.date || !item.high);

store.dataFormater = rawData =>
  rawData.map(row => [row.open, row.high, row.low, row.close, row.date]);

// number Formatter
store.f = (_number, fixDigit = 5) =>
  Math.abs(parseFloat(_number).toFixed(fixDigit));

export default {
  ...store
};