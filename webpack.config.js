module.exports = {
  entry: './lib/index.js',
  output: {
    libraryTarget: 'umd',
    library: 'Lines',
  },
  // target: 'node',
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  }
};