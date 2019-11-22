import { expect } from "chai";
import { func } from "../webpack/mod2";

describe("test second module", function () {
  it("Check 60", function () {
    expect(func(20)).to.equal(60);
  });
});