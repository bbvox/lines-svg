# Lines SVG chart Library

[![Build Status](https://travis-ci.org/bbvox/lines-svg.svg?branch=master)](https://travis-ci.org/bbvox/lines-svg)
[![Coverage Status](https://coveralls.io/repos/github/bbvox/lines-svg/badge.svg?branch=master)](https://coveralls.io/github/bbvox/lines-svg?branch=master)

## About the project

LinesSvg is a script that builds on top of Snap SVG to make possible one of the most used forex charts. You can make it with animations or with direct draw!

Currently script/library support several types of charts:
 1. Linear chart
 2. Japan candlestick
 3. Simple Moving Average
 4. Exponential Movin Average

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
var lines = new Lines("svgBox");
lines.data(ratesJson);
lines.draw("axis");
lines.draw("line");
lines.draw("sma");
// l.live();
lines.drawSMA(20);
lines.liveLine({tube: 1});
lines.draw("sma"); //sma50
```

## DESCRIPTION

http://mikemcl.github.io/big.js/