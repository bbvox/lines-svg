import store from "./store";
import utils from "./utils";

import cfg, { SVG, PART } from "./config";
import Chart from './chart';

export default class Candle extends Chart {
  //call parent constructor
  constructor(elemId, calcInstance) {
    super(elemId, calcInstance);
  }

  //default for inital setup of method
  init() {
    super.init();
    // this.calc.candleWidth();
  }

  drawCandle() {
    cl("draw Candle NOW ...:", store.all(), store.get("stepX"));


  }

}