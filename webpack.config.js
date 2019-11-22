// const path = require('path');
let glob = require("glob");

let entry = __dirname + "/webpack/index.js";
let outputPath = __dirname + "/dist/";
let devtool = "";
if (process.env.TESTBUILD) {
  entry = glob.sync(__dirname + "/webpack_test/*.test.js");
  outputPath = __dirname + "/test-dist/";
  devtool = "source-map";
}


module.exports = {
  mode: "production",
  // entry: './webpack/index.js',
  // devtool: 'inline-source-map',
  entry,
  devtool,
  output: {
    // filename: 'build.js',
    // path: __dirname + 'webpack'
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