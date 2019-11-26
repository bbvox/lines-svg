const expect = require("chai").expect;
const mod = require('../tst/mod');

describe("Mod - tests", function () {
  it("Check calc function", function () {
    expect(mod.calc(10, 20)).to.equal(30);
  });
});