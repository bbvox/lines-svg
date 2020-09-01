module.exports = (function () {
  let elemCount = 0;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const utils = {};
  //formater
  utils.f = (_number, fixDigit = 5) =>
    Math.abs(parseFloat(_number).toFixed(fixDigit));
  utils.fDate = (timeStamp, period = "1d") => {
    const date = new Date(timeStamp);
    if (period === "15m") {
      return `${date.getHours()}:${date.getMinutes()}`;
    } else if (period === "1h") {
      return `${date.getHours()}:00`;
    } else if (period === "4h") {
      return `${date.getDate()} ${date.getHours()}:00`;
    } else if (period === "1d") {
      return `${months[date.getMonth()]}'${date.getDate()}`;
    }
  };

  utils.candle = (candlePoint, type = "body") => {
    const allowedFields = {
      body: ["x", "y", "width", "height", "isWin"],
      shadow: ["top", "bottom", "isWin"],
    };
    return Object.keys(candlePoint)
      .filter((key) => allowedFields[type].includes(key))
      .reduce((obj, key) => {
        obj[key] = candlePoint[key];
        return obj;
      }, {});
  };

  utils.genId = (elemType = "line") => {
    ++elemCount;
    return `${elemType}-${elemCount}`;
  };

  return {
    ...utils,
  };
})();
