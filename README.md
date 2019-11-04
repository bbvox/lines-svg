# Lines SVG chart Library

[![Build Status](https://travis-ci.org/bbvox/lines-svg.svg?branch=master)](https://travis-ci.org/bbvox/lines-svg)
[![Coverage Status](https://coveralls.io/repos/github/bbvox/lines-svg/badge.svg?branch=master)](https://coveralls.io/github/bbvox/lines-svg?branch=master)

## About the project

LinesSvg is a financial chart library based on snapsvg. You can use it to create HTML5 forex/stock asset charts. The library support time based graphics, toolset for end users draw, animation of data and store in PNG or Canvas.

Currently script/library support these types of charts:
 1. Linear chart
 2. Japan candlestick
 3. Simple Moving Average(SMA)
 4. Exponential Moving Average(EMA)

## LIBRARY DEMO

[linesSVG charts Demo](https://bbvox.github.io/lines-svg/example/demo.html)

## Installation

```bash
$ git clone
$ cd project_folder
$ npm install
$ npm run build
```

## Running Tests

Install development dependencies:

```bash
$ npm install
```

Then:

```bash
$ npm test
```

## Available options

```
var chartData = [['open', 'high', 'low', 'close']]
var lines = new Lines("svgBox");
lines.data(chartData);
lines.draw("all");
```

## DESCRIPTION

Interface and function signature are : 
1. Constructor <b>Lines("SVG element ID")</b>, expect argument to be existing HTML svg element, with ID.
2. Instance.data(dataSet) method, expect dataSet to be Array, with members ['open', 'high', 'low', 'close'].
3. Instance.draw(type) method, expect/support: all, line, candle, sma, ema type of charts. Default value is all.

4. Library support also end user draw of lines, arrows, tunels.

### todo

1. Transfer library to typescript & use the option to modulize it. Export some of the properties to different file. 
```
npm run build:watch
npm start
IP : 5000 / example/build.html
```
