if (typeof require !== "undefined") {
  var expect = require("chai").expect;
  var sinon = require("sinon");
  var Lines = require("../index");

  require("jsdom-global")();
  var noop = function () { };
  global.window.Snap = noop;

  document.body.innerHTML = "<nav id='navBar'></nav><svg id='elementId'></svg>";

  var tdata = require("./test-data");
}

describe("Lines constructor", function () {
  var getId, Snap;
  it("should throw Error w/o element", function () {
    getId = sinon.stub(Lines.prototype, "getId").returns(false);

    expect(function () {
      new Lines();
    }).to.throw(Error);
  });

  it("should throw Error w/o Snap.svg lib", function () {
    getId = sinon.stub(Lines.prototype, "getId").returns(true);
    Snap = sinon.stub(global.window, "Snap").returns(false);

    expect(function () {
      new Lines();
    }).to.throw(Error);
  });

  it("should call getId with define elementId", function () {
    getId = sinon.spy(Lines.prototype, "getId");

    new Lines(tdata.elemID);
    expect(getId.calledWith(tdata.elemID)).to.be.true;
  });

  it("should return instanceof Lines", function () {
    var lines = new Lines(tdata.elemID);
    expect(lines).to.be.an.instanceof(Lines);
  });

  afterEach(function () {
    getId && getId.restore();
    Snap && Snap.restore();
  });
});


describe("Lines cfg properties & data method", function () {
  var lines;
  before(function () {
    lines = new Lines(tdata.elemID);
    lines.reset();
  });

  it("config property should be available", function () {
    expect(lines.cfg).to.exist;
  });

  it("init Data > raw, min, max should be undefined", function () {
    var raw, min, max;
    raw = lines.gg("raw");
    min = lines.gg("min");
    max = lines.gg("max");
    expect(lines.dset.init).to.be.an("object");
    // expect(raw).to.be.empty;
    expect(raw).to.be.false;
    expect(min).to.be.false;
    expect(max).to.be.false;
  });

  it("init Data > raw, min, max should be define", function () {
    lines.data(tdata.initData);

    expect(lines.dset.init.raw).to.be.an("array");
    expect(lines.gg("min")).to.equal(tdata.min);
    expect(lines.gg("max")).to.equal(tdata.max);
  });
});

describe("Lines draw method param", function () {
  var lines, spyDraw = {};
  before(function () {
    lines = new Lines(tdata.elemID);
  });

  it("should call drawAxis when param is axis", function () {
    lines.data(tdata.initData);
    spyDraw.axis = sinon.stub(lines, "drawAxis");
    lines.draw("axis");

    expect(spyDraw.axis.calledOnce).to.be.true;
  });

  it("should call drawLine when param is line", function () {
    lines.data(tdata.initData);
    spyDraw.line = sinon.stub(lines, "drawLine");
    lines.draw("line");
    expect(spyDraw.line.calledOnce).to.be.true;
  });

  it("should call drawCandle when param is candle", function () {
    lines.data(tdata.initData);
    spyDraw.candle = sinon.stub(lines, "drawCandle");
    lines.draw("candle");
    expect(spyDraw.candle.calledOnce).to.be.true;
  });

  it("should call drawSMA when draw's param is sma", function () {
    lines.data(tdata.initData);
    spyDraw.sma = sinon.stub(lines, "drawSMA");
    lines.draw("sma");
    expect(spyDraw.sma.calledOnce).to.be.true;
  });

  it("should call drawEMA when param is ema", function () {
    lines.data(tdata.initData);
    spyDraw.ema = sinon.stub(lines, "drawEMA");
    lines.draw("ema");
    expect(spyDraw.ema.calledOnce).to.be.true;
  });

  it("should call all when param is all and animate false", function () {
    lines.data(tdata.initData);
    spyDraw.axis = sinon.stub(lines, "drawAxis");
    spyDraw.line = sinon.stub(lines, "drawLine");
    spyDraw.candle = sinon.stub(lines, "drawCandle");
    spyDraw.sma = sinon.stub(lines, "drawSMA");
    spyDraw.ema = sinon.stub(lines, "drawEMA");
    lines.cfg.animate = false;
    lines.draw("all");
    expect(spyDraw.axis.calledOnce).to.be.true;
    expect(spyDraw.line.calledOnce).to.be.true;
    expect(spyDraw.candle.calledOnce).to.be.true;
    expect(spyDraw.sma.calledOnce).to.be.true;
    expect(spyDraw.ema.calledOnce).to.be.true;
  });

  it("should call drawAxis when param is all and cfg.animate true", function () {
    lines.data(tdata.initData);
    spyDraw.axis = sinon.stub(lines, "drawAxis");

    lines.cfg.animate = true;
    lines.draw("all");

    expect(spyDraw.axis.calledOnce).to.be.true;
  });

  afterEach(function () {
    ["axis", "line", "candle", "sma", "ema"].forEach(val => {
      spyDraw[val] && spyDraw[val].restore();
    });
  });
});

