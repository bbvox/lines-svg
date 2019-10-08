let chart = {};

let _chartStore = {};

class Chart {
  constructor(elemId) {
    if (!window.getComputedStyle) {
      return;
    }

    _chartStore.elemId = elemId;
    console.log("chart constructor set ELEM _ ID ...")
  }

  get(prop) {
    return _chartStore[prop];
  }
}

// try to convert to class 
chart.setup = (elemId) => {


  chart.set("elemId", elemId);
  let elem = {};
  elem.style = window.getComputedStyle();

}

chart.set = (chartProperty, chartValue) => {
  _chartStore[chartProperty] = chartValue;
}

chart.getEl = (elemID) => document.getElementById(elemID);

// export default {
//   ...chart
// };
export default Chart;