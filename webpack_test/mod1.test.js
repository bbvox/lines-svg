import { expect } from "chai";
import { exp } from "../webpack/mod1";

describe("test one", function () {
  it("Check whole test suit", function () {
    expect(exp.func5()).to.equal(5);
  });
});