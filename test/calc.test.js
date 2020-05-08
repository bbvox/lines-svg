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
  
  it("Calc.dataToPoints - check result from line data", () => {
    const lineData = store.get("data");
    const points = calc.dataToPoints(lineData);

    expect(points).to.deep.equal(testData.expectedPoints);
  });

  it("Calc.main - check calculated AXIS points !", () => {
    calc.main();

    const points = store.get("points", "line");
    expect(points).to.deep.equal(testData.expectedPoints);
  });

  it("Calc.yAxis - check yAxis label axis point [xAxis, yAxis] and label", () => {
    const yAxis = calc.yAxis();
    expect(yAxis).to.deep.equal(testData.expectedYAxis);
  });

  // findYpixel
  it("Calc.findYpixel - check find pixel", () => {
    calc.init();
    calc.initSteps();

    const foundPixel = calc.findYpixel(testData.findY.inputPixel);
    expect(foundPixel).to.equal(testData.findY.expectedPixel);

    const foundPixel2 = calc.findYpixel(testData.findY.inputPixel2);
    expect(foundPixel2).to.equal(testData.findY.expectedPixel2);
  });

  it("Calc.findY - check findY value/pixel", () => {
    calc.init();
    calc.initSteps();

    const foundY = calc.findY(testData.findY.inputPixel);
    expect(foundY).to.deep.equal(testData.findY.expectedFoundY);
  });

  after(() => {
    //restore calc methods
    Object.keys(stubs).forEach(stubKey => {
      stubs[stubKey] && stubs[stubKey].restore();
    });

    store.reset();
  });
});