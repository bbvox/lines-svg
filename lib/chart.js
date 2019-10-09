import store from "./store";

import cfg, { SVG, PART } from "./config";

let chart = {};

// ? ? 
let _chartStore = {};

class Chart {
  constructor(elemId) {
    if (!window.getComputedStyle) {
      return;
    }

    _chartStore.elemId = elemId;
    this.el = this.getId(elemId);
    this.snap = window.Snap("#" + elemId);

    this.init();
  }

  // init AREA
  // 
  init() {
    let elemStyle, width, height;

    elemStyle = window.getComputedStyle(this.el);
    width = parseInt(elemStyle.width);
    height = parseInt(elemStyle.height);

    this.area = {
      w: width,
      h: height,
      width: (width - (cfg.chart.padding * 2)),
      height: (height - (cfg.chart.padding * 2)),
      endX: cfg.chart.padding,
      zeroX: width,
      zeroY: height - cfg.chart.padding,
      offsetLeft: this.el.offsetLeft || this.el.parentElement.offsetLeft || 0,
      offsetTop: this.el.offsetTop || this.el.parentElement.offsetTop || 0
    }

    console.log("--- element STYLE : ", this.area);
  }

  get(prop) {
    return _chartStore[prop];
  }

  drawAxis() {
    this.drawLabels("X");
    this.drawLabels("Y");
  }

  drawLabels(axis) {
    if (axis === "X") {
      console.log("draw X axis");
      this.draw();
    } else if (axis === "Y") {
      console.log("draw Y axis");
    }
  }

  draw() {
    const lineProp = {
      path: "M30 400L799 400M30 326L799 326M30 252L799 252M30 178L799 178M30 104L799 104M30 30L799 30",
      type: "axis"
    }
    const svg = this.snap.path(lineProp.path);
    // svgAttr.class = lineProp.class || this.cfg.cssClass[lineProp.type];
    svg.attr({ class: "staxis wcandle" });
  }

  getId(elemId) {
    return document.getElementById(elemId);
  }
}

export default Chart;