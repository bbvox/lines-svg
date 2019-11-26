const expect = require("chai").expect;
const conf = require('../tst/conf');

describe("Conf - tests", function () {
  it("Check bbb function", function () {
    expect(conf.bbb("brb")).to.equal("brb");
  });
});