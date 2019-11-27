module.exports = (function () {
  const utils = {};
  //formater
  utils.f = (_number, fixDigit = 5) =>
    Math.abs(parseFloat(_number).toFixed(fixDigit))

  utils.fDate = (timeStamp, period = "15m") => {
    const date = new Date(timeStamp);
    // ("3123" + d.getMinutes()).slice(-4)
    if (period === "15m") {
      return date.getHours() + ":" + date.getMinutes();
    }
  }

  return {
    ...utils
  };
})();