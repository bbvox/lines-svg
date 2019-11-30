const expect = require("chai").expect;
const sinon = require("sinon");
const Calc = require("../lib/calc");

const store = require("../lib/store");
const { calc: testData, store: storeData } = require("./test.data");

describe("Check Calc - calculate class", function () {
  let calc, stubs = {};
  before(() => {
    // prepare store - raw OHLC data + timestamp
    store.save(storeData.input);
    // initialize calc
    calc = new Calc();
  });

  it("Calc.init - check store for min, max, amplitude", () => {
    calc.init();

    const { min, max, amplitude } = store.mget(["min", "max", "amplitude"]);
    expect(min).to.equal(testData.initMin);
    expect(max).to.equal(testData.initMax);
    expect(amplitude).to.equal(testData.initAmplitude);
  });

  it("Calc.initSteps - check store for stepX, stepY, zeroX, zeroY", () => {
    store.set("area", storeData.inputArea);
    calc.initSteps();

    const { stepX, stepY, zeroX, zeroY } = store.mget(["stepX", "stepY", "zeroX", "zeroY"]);
    expect(stepX).to.equal(testData.expectedSteps.stepX);
    expect(stepY).to.equal(testData.expectedSteps.stepY);
    expect(zeroX).to.equal(testData.expectedSteps.zeroX);
    expect(zeroY).to.equal(testData.expectedSteps.zeroY);
  });

  it("Calc.start - check if start call init & initSteps", () => {
    stubs.init = sinon.stub(calc, "init");
    stubs.initSteps = sinon.stub(calc, "initSteps");
    calc.start();

    expect(stubs.init.calledOnce).to.be.true;
    expect(stubs.initSteps.calledOnce).to.be.true;
  });

  it("Calc.main - check calculated AXIS points !", () => {
    calc.main();

    const points = store.get("points");
    expect(points).to.deep.equal(testData.expectedPoints);
  });

  it("Calc.yAxis - check yAxis label axis point [xAxis, yAxis] and label", () => {
    const yAxis = calc.yAxis();
    expect(yAxis).to.deep.equal(testData.expectedYAxis);
  });

  after(() => {
    //restore calc methods
    Object.keys(stubs).forEach(stubKey => {
      stubs[stubKey] && stubs[stubKey].restore();
    });

    store.reset();
  });
});