module.exports = {
  entry: './tst/index.js',
  output: {
    filename: 'tstBundle.js',
    libraryTarget: 'umd'
  },
  target: 'node',
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