const path = require('path');

module.exports = {
  entry: './webpack/index.js',
  devtool: 'inline-source-map',
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, 'webpack')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
}


// library: 'lines',