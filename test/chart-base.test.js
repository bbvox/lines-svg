const expect = require("chai").expect;
const sinon = require("sinon");
const ChartBase = require("../lib/chart-base");
const Calc = require("../lib/calc");
const store = require("../lib/store");

const { chart: testData, store: storeData } = require("./test.data");

require("jsdom-global")();

global.window.Snap = testData.noop;
document.body.innerHTML = testData.html;

describe("Check ChartBase class", function () {
  let chart,
    calc,
    stubs = {};

  //prepare store & calc points & mock svgText
  const prepareToDraw = () => {
    store.save(storeData.input);
    calc.start();
    calc.main();

    stubs.svgText = sinon.stub(chart, "svgText");
  };

  // get firstArguments from Stubs - 
  // return array
  const getArguments = (start, end, stubName = "svgText") => {
    let idx = start;
    let args = [];
    while (idx <= end) {
      // push first svgText argument
      args.push(stubs[stubName].getCall(idx).args[0]);
      idx++;
    }
    return args;
  };

  before(() => {
    // mock computedStyle
    stubs.windowStyle = sinon
      .stub(global.window, "getComputedStyle")
      .returns(testData.computedStyle);

    calc = new Calc();
    chart = new ChartBase(testData.elemId);
  });

  it("Chart.init - constructor > init > getComputedStyle called once", () => {
    expect(stubs.windowStyle.calledOnce).to.be.true;
  });

  it("Chart.init - check area store width: w, height: h", () => {
    const { w, h } = store.get("area");

    expect(w).to.equal(testData.computedStyle.width);
    expect(h).to.equal(testData.computedStyle.height);
  });

  it("Chart.drawLabelsX - check svgText arguments", () => {
    prepareToDraw();
    chart.drawLabelsX();

    const svgTextArguments = getArguments(0, 4);
    expect(svgTextArguments).to.deep.equal(
      testData.expectedSvgText.argumentsLabelX
    );
  });

  it("Chart.drawLabelsY - check svgText arguments", () => {
    stubs.svgPath = sinon.stub(chart, "svgPath");
    chart.drawLabelsY();

    const svgTextArguments = getArguments(5, 9);
    expect(svgTextArguments).to.deep.equal(
      testData.expectedSvgText.argumentsLabelY
    );
  });

  it("Chart.drawLine - check svgText arguments", () => {
    stubs.svgDebug = sinon.stub(chart, "svgDebug");
    chart.drawLine();

    //call len-1 times
    const debugArguments = getArguments(0, 3, "svgDebug");
    expect(debugArguments).to.deep.equal(testData.expectedDebugArguments);
  });

  after(() => {
    //restore calc methods
    Object.keys(stubs).forEach((stubKey) => {
      stubs[stubKey] && stubs[stubKey].restore();
    });
  });
});
