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

//SMA & EMA
describe("Lines check SMA / EMA", function() {
  var lines, spyDraw = {};
  before(function() {
    lines = new Lines(tdata.elemID);
    lines.data(tdata.initData);

    lines.snap = {};
    lines.snap.text = noop;
    lines.snap.path = noop;
    lines.snap.circle = noop;
  });

  it("drawSMA should call printPath with params", function() {
    spyDraw.path = sinon.stub(lines.snap, "path").returns({ attr: noop });
    spyDraw.store = sinon.stub(lines, "store");
    spyDraw.debug = sinon.stub(lines, "debugDot");
    spyDraw.circle = sinon.stub(lines.snap, "circle").returns({ attr: noop });
    spyDraw.prpath = sinon.stub(lines, "printPath");

    lines.cfg.smaLength = 2;
    lines.draw("sma");

    expect(spyDraw.prpath.calledOnce).to.be.true;
  });

  it("drawEMA should call printPath with params", function() {
    spyDraw.path = sinon.stub(lines.snap, "path").returns({ attr: noop });
    spyDraw.store = sinon.stub(lines, "store");
    spyDraw.debug = sinon.stub(lines, "debugDot");
    spyDraw.circle = sinon.stub(lines.snap, "circle").returns({ attr: noop });
    spyDraw.prpath = sinon.stub(lines, "printPath");

    lines.cfg.emaLength = 2;
    lines.draw("ema");

    expect(spyDraw.prpath.calledOnce).to.be.true;
  });

  afterEach(function() {
    ["store", "debug", "animate", "path", "prpath", "circle"].forEach(val => {
      spyDraw[val] && spyDraw[val].restore();
    });
  });
});