let math = {
  math1: 10,
  math2: "gogo"
};

class Mth {
  constructor(mid) {
    this.mid = mid;
  }

  calc() {
    console.log("---- calc MATH method ...", this);
  }
}

// export default {
//   ...math
// };

export const math1 = math.math1;

export default Mth;
