import store from "./store";

class Calc {
  constructor() {
    this.init();
  }

  // min, max & attitude
  init() {
    const data = store.get("data");
    const init = {
      min: 0,
      max: 0,
      amplitude: 0
    };
    data.forEach(item => {
      if (init.min > item) init.min = item;
      if (init.max < item) init.max = item;
    });
    init.amplitude = store.f(init.max - init.min);

    store.mset(init);
  }

  //
  setup() {

  }

  calc() {
    console.log("---- calc MATH method ...", this);
  }
}

export default Calc;
