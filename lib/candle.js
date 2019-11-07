import store from "./store";
import utils from "./utils";

import cfg, { SVG, PART } from "./config";
import Chart from './chart';

export default class Candle extends Chart {

  constructor(elemId, calcInstance) {
    //call parent constructor
    super(elemId, calcInstance);
  }

  //default for inital setup of method
  init() {
    // call parent init method
    super.init();

    this.calc.candleWidth();

    console.log("second init ...");
  }

  ggg() {

  }

}