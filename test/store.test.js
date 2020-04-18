const expect = require("chai").expect;
const store = require("../lib/store");

const { store: testData } = require("./test.data");

describe("Check store functions", () => {
  it("store.save & get - Split(labels,data, raw), save data and get data", () => {
    store.save(testData.input);
    const storedData = store.get('data');
    expect(storedData).to.deep.equal(testData.expectedData);

    const storedLabels = store.get('labels');
    expect(storedLabels).to.deep.equal(testData.expectedLabels);
  });

  it("store.save & mget - Multi value get", () => {
    store.save(testData.input);
    const { data, labels } = store.mget(['data', 'labels']);
    expect(data).to.deep.equal(testData.expectedData);
    expect(labels).to.deep.equal(testData.expectedLabels);
  });

  it("store.push - Init and push into array", () => {
    store.push('init.test', testData.inputPush[0]);
    store.push('init.test', testData.inputPush[1]);
    const { test } = store.mget(["test"]);
    expect(test).to.deep.equal(testData.expectedPush);
  });

  it("store.set - Check Setter", () => {
    store.set('test', testData.setter);
    const setterData = store.get('test');
    expect(setterData).to.equal(testData.setter);
  });

  // input DATA: [{ open, high, low, close, date }, ...]
  it("store.dataFormatter - Input data with object/keys, check formatter", () => {
    store.save(testData.inputUnformatted);

    const formattedData = store.get("raw");
    expect(formattedData).to.deep.equal(testData.expectedFormatted);
  });
});