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

  utils.candle = (candlePoint, type = "body") => {
    const allowedFields = {
      body: ["x", "y", "width", "height", "isWin"],
      shadow: ["top", "bottom", "isWin"]
    };
    return Object.keys(candlePoint)
      .filter(key =>
        (allowedFields[type].includes(key)))
      .reduce((obj, key) => {
        obj[key] = candlePoint[key];
        return obj;
      }, {});
  }

  return {
    ...utils
  };
})();