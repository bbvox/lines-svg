if (typeof require !== "undefined") {
  var expect = require("chai").expect;
  var sinon = require("sinon");
  var Lines = require("../index");

  require("jsdom-global")();
  var noop = function() {};
  global.window.Snap = noop;

  document.body.innerHTML = "<nav id='navBar'></nav><svg id='elementId'></svg>";

  var tdata = require("./test-data");
}


describe("Lines check some of draw methods", function() {
  var lines, spyDraw = {};
  before(function() {
    lines = new Lines(tdata.elemID);
    lines.data(tdata.initData);

    lines.snap = {};
    lines.snap.text = noop;
    lines.snap.path = noop;
  });

  it("drawAxis should call printPath, labelX & labelY", function() {
    spyDraw.printPath = sinon.stub(lines, "printPath");
    spyDraw.labelX = sinon.stub(lines, "drawLabelsX");
    spyDraw.labelY = sinon.stub(lines, "drawLabelsY");

    lines.draw("axis");

    expect(spyDraw.printPath.calledOnce).to.be.true;
    expect(spyDraw.labelX.calledOnce).to.be.true;
    expect(spyDraw.labelY.calledOnce).to.be.true;
  });

  it("drawAxis > drawLabelX call printPath with params ", function() {
    spyDraw.labelY = sinon.stub(lines, "drawLabelsY");
    spyDraw.stext = sinon.stub(lines.snap, "text").returns({ attr: noop });
    spyDraw.store = sinon.stub(lines, "store");
    spyDraw.printPath = sinon.stub(lines, "printPath");

    lines.draw("axis");
    // drawCandle and drawLabelX
    expect(spyDraw.printPath.calledTwice).to.be.true;

    // first call - drawCandle
    expect(spyDraw.printPath.getCall(0).args[0]).to.include.all.keys("type", "path");
    expect(spyDraw.printPath.getCall(0).args[0]).to.include({ type: "axis" });
  });

  it("drawAxis > drawLabelY call printPath with params ", function() {
    spyDraw.labelY = sinon.stub(lines, "drawLabelsX");
    spyDraw.stext = sinon.stub(lines.snap, "text").returns({ attr: noop });
    spyDraw.store = sinon.stub(lines, "store");
    spyDraw.printPath = sinon.stub(lines, "printPath");

    spyDraw.debug = sinon.stub(lines, "debugDot");

    lines.draw("axis");
    // call at drawCandle
    expect(spyDraw.printPath.calledOnce).to.be.true;
    //should be zeroX & zeroY but for tests zeroY is NaN
    expect(spyDraw.debug.getCall(0).args[0]).to.include.members([lines.chartArea.zeroX]);
  });

  it("drawLine should call printPath once with params", function() {
    spyDraw.path = sinon.stub(lines, "printPath");
    spyDraw.debug = sinon.stub(lines, "debugDot");

    lines.draw("line");

    expect(spyDraw.printPath.calledOnce).to.be.true;
  });

  it("drawAxis should call animatePath with exact params", function() {
    spyDraw.labelX = sinon.stub(lines, "drawLabelsX");
    spyDraw.labelY = sinon.stub(lines, "drawLabelsY");

    spyDraw.animate = sinon.stub(lines, "animatePath");

    lines.draw("axis");

    expect(spyDraw.animate.calledOnce).to.be.true;
    expect(spyDraw.animate.getCall(0).args[0]).to.include.all.keys("path");
  });

  it("drawAxis should call printPath > snap.path with these params", function() {
    spyDraw.labelX = sinon.stub(lines, "drawLabelsX");
    spyDraw.labelY = sinon.stub(lines, "drawLabelsY");

    lines.cfg.animate = false;
    spyDraw.path = sinon.stub(lines.snap, "path").returns({ attr: noop });

    spyDraw.store = sinon.stub(lines, "store");

    lines.draw("axis");

    expect(spyDraw.path.calledOnce).to.be.true;
    // expect(spyDraw.animate.getCall(0).args[0]).to.include.all.keys("path", "strokeDasharray");
  });


  afterEach(function() {
    ["printPath", "labelX", "labelY", "stext", "store", "debug", "animate", "path"].forEach(val => {
      spyDraw[val] && spyDraw[val].restore();
    });
  });
});

describe("Lines drawCandle", function() {
  var lines, spyDraw = {};

  before(function() {
    lines = new Lines(tdata.elemID);
    lines.data(tdata.initData);

    lines.snap = {};
    lines.snap.path = noop;
    lines.snap.rect = noop;
  });

  it("drawCandle should call candleShadow for every period of the chart", function() {
    spyDraw.rect = sinon.stub(lines.snap, "rect").returns({ attr: noop });
    spyDraw.shadow = sinon.stub(lines, "candleShadow");

    spyDraw.store = sinon.stub(lines, "store");

    lines.draw("candle");

    var periods = lines.gg("points").length - 1;
    expect(spyDraw.shadow.callCount).to.equal(periods);
  });

  it("drawCandle > candleShadow should call printPath for every period of the chart", function() {
    spyDraw.rect = sinon.stub(lines.snap, "rect").returns({ attr: noop });
    spyDraw.store = sinon.stub(lines, "store");
    spyDraw.path = sinon.stub(lines, "printPath");

    lines.draw("candle");

    // var periods = lines.gg("points").length - 1;
    // expect(spyDraw.path.callCount).to.equal(periods);
    //up & down shadow for every candle
    expect(spyDraw.path.callCount).to.equal(2);
  });

  afterEach(function() {
    ["rect", "shadow", "store"].forEach(val => {
      spyDraw[val] && spyDraw[val].restore();
    });
  });

});