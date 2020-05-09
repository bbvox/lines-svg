# Lines SVG chart Library

[![npm version](https://img.shields.io/npm/v/lines-svg.svg?style=flat)](https://www.npmjs.com/package/lines-svg)
[![Build Status](https://travis-ci.org/bbvox/lines-svg.svg?branch=master)](https://travis-ci.org/bbvox/lines-svg)
[![Coverage Status](https://coveralls.io/repos/github/bbvox/lines-svg/badge.svg?branch=master)](https://coveralls.io/github/bbvox/lines-svg?branch=master)

## About the project

LinesSvg is a financial chart library based on snapsvg. You can use it to create HTML5 forex/stock charts. The library support standart time based graphics(linear, sma, ema ...), toolset for end users to draw(hints, notes, signals) and create snapshots in PNG or Canvas format.

### Supported charts:

1.  Linear
2.  Japan candlestick
3.  Simple Moving Average(SMA)
4.  Exponential Moving Average(EMA)

### Drawing feature:

1.  Rectangle
2.  Circle
3.  Line
4.  Text
5.  Pointer

## Installation

1. Npm
   `npm install lines-svg`

2. From repo

```bash
$ git clone
$ cd project_folder
$ npm install
$ npm run build
```

## Demo and initialize snippet

[linesSVG charts Demo](https://bbvox.github.io/lines-svg/example/)

```bash
const chartData = [
  [1.1, 1.1, 1.3, 1.2, 1588368812844]
  ...
]; // ohlc Data with timestamp
const l = new Lines(elementID);
l.data(chartData);
l.draw();
```

## Running Tests

Install development dependencies:

```bash
$ npm install
```

Then:

```bash
$ npm run test
```

## DESCRIPTION

Interface and functions signature are :

1. Constructor <b>Lines("elementID")</b>, expect argument to be existing DOM svg element with elementID.
2. Instance.data(dataSet) method expect dataSet to be Array with particular structure ['open', 'high', 'low', 'close', 'timestamp'].
3. Instance.draw(type) method, expect/support: all, line, candle, sma, ema type of charts. Default value is all.
4. Library support also end user draw of lines, arrows, tunels.

### todo

1. Transfer library to typescript & use the option to modulize it. Export some of the properties to different file.

```
npm run build:watch
npm start
IP : 5000 / example/build.html
```

- https://github.com/andyhaskell/webpack-mocha-tutorial
- https://github.com/vyasriday/webpack-js-library

https://medium.com/@binyamin/creating-a-node-express-webpack-app-with-dev-and-prod-builds-a4962ce51334
