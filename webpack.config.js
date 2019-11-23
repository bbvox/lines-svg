// const path = require('path');
let glob = require("glob");

// let entry = __dirname + "/webpack/index.js";
let entry = __dirname + "/lib/index.js";
let outputPath = __dirname + "/dist/";
let filename = "build.js";
let devtool = "";
if (process.env.TEST) {
  // entry = glob.sync(__dirname + "/test/*.test.js");
  entry = {
    calc: __dirname + "/test/calc.test.js",
    store: __dirname + "/test/store.test.js"
  };
  filename = "[name].test.js";
  outputPath = __dirname + "/dist_test/";
  // devtool = "inline-source-map";
}


module.exports = {
  // mode: "production",
  // entry: './webpack/index.js',
  // devtool: 'inline-source-map',
  entry,
  devtool,
  output: {
    // filename: 'build.js',
    // path: __dirname + 'webpack'
    filename,
    path: outputPath
  },
  // target: "web",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: ["/node_modules/"],
        use: {
          loader: 'babel-loader',
          // options: {
          //   presets: ["env"],
          // }
        }
      }
    ]
  }
}


// library: 'lines',