module.exports = {
  entry: [
    "snapsvg/dist/snap.svg.js",
    "./lib/index.js"
  ],
  output: {
    libraryTarget: "umd",
    library: "Lines",
  },
  // target: 'node',
  module: {
    rules: [
      {
        test: require.resolve('snapsvg/dist/snap.svg.js'),
        use: 'imports-loader?this=>window,fix=>module.exports=0',
      },
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
    ],
  },
};
