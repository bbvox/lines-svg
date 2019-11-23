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