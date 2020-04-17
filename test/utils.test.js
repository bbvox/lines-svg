const expect = require("chai").expect;
const utils = require("../lib/utils");
const sinon = require("sinon");

const { utils: testData, timeOffset } = require("./test.data");

describe("Check utils functions", () => {
  it("utils.f - Format a number with five decimals", () => {
    const formated = utils.f(testData.input);
    expect(formated).to.equal(testData.expected);
  });

  it("utils.f - Format a number with 0 decimals", () => {
    const formated = utils.f(testData.input, 0);
    expect(formated).to.equal(testData.expected2);
  });

  it("utils.fDate - Get Hour and minutes for period 15m", () => {
    const dateHourMin = utils.fDate(testData.inputTimestamp);
    const timeOffset = new Date().getTimezoneOffset()
    let expectedTime;
    // UTC -2
    if (timeOffset === timeOffset) {
      expectedTime = testData.expectedTime.hour + ":" + testData.expectedTime.min;
    } else {
      expectedTime = testData.expectedTime.hourUtc + ":" + testData.expectedTime.min;
    }
    expect(dateHourMin).to.equal(expectedTime);
  });
});