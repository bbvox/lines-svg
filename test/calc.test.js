const expect = require("chai").expect;
const Calc = require("../lib/calc");

const store = require("../lib/store");
const { calc: testData, store: storeData } = require("./test.data");

describe("Check Calc - calculate class", function () {
  let calc;
  //initialize calc
  before(() => {
    store.save(storeData.input);

    calc = new Calc();
  });

  it("Calc init - check store", () => {
    calc.init();
    const { min, max, amplitude } = store.mget(["min", "max", "amplitude"]);
    expect(50).to.equal(50);
    expect(min).to.deep.equal(testData.initMin);
    expect(max).to.deep.equal(testData.initMax);
    expect(amplitude).to.deep.equal(testData.initAmplitude);
  });
});