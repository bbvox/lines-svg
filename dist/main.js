!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.Lines=e():t.Lines=e()}(window,(function(){return function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=3)}([function(t,e){function n(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function r(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?n(r,!0).forEach((function(e){o(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):n(r).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function o(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}var i={},a={raw:[],labels:[],data:[]};i.save=function(t){var e=i.validate(t)?t:i.dataFormater(t);i.mset({raw:e,labels:e.map((function(t){return t[4]})),data:e.map((function(t){return t[3]}))})},i.all=function(){return a},i.get=function(t){return a[t]},i.mget=function(t){var e={};return t.forEach((function(t){e[t]=a[t]})),e},i.push=function(t,e){a[t]||(a[t]=[]),a[t].push(e)},i.set=function(t,e){a[t]=e},i.mset=function(t){a=r({},a,{},t)},i.validate=function(t){return t.every((function(t){return!t.date||!t.high}))},i.dataFormater=function(t){return t.map((function(t){return[t.open,t.high,t.low,t.close,t.date]}))},t.exports=r({},i)},function(t,e){t.exports={config:{animate:!1,zoomMove:!0,chart:{type:["line","candle","sma","ema"],padding:30,attr:{stroke:"#ddd",fill:"none",strokeWidth:1},textAttr:{"stroke-width":"0.1px","font-family":"Verdana","font-size":"12px",fill:"#000"},textBold:{"font-weight":"bold"},enableGrid:!0,candleFill:.4,totalGrids:5,navDot:6},cssClass:{textLabel:"tlabel",liveLabel:"llabel",liveLine:"lline",liveDot:"ldot",winCandle:"wcandle",loseCandle:"lcandle",debugDot:"ddot",line:"stline",sma:"stsma",ema:"stema",grid:"staxis",navDot:"stnavdot",moveNavDot:"movedot",rotateNavDot:"rotatedot"},smaLength:5,emaLength:10,magnetMode:50,step:{x:50,xMin:20,xMax:100,yMax:20,arrow:50,zoom:9,offset:9,xLegend:100},debug:{radius:6,attr:{stroke:"red"}},timeUnit:"15m",timeUnits:["15m","30m","1h","4h","1d","1w"],drawOrder:["drawLine","drawCandle","drawSMA","drawEMA"]},SVG:{line:"line",text:"text",rect:"rect",circle:"circle",path:"path",input:"input"},PART:{axis:"axis",line:"line",candle:"candle",legend:"legend",debug:"debug",sinit:"sinit",init:"init",sma:"sma",ema:"ema"}}},function(t,e){function n(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function r(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}t.exports=function(t){for(var e=1;e<arguments.length;e++){var o=null!=arguments[e]?arguments[e]:{};e%2?n(o,!0).forEach((function(e){r(t,e,o[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(o)):n(o).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(o,e))}))}return t}({},{f:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:5;return Math.abs(parseFloat(t).toFixed(e))},fDate:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"15m",n=new Date(t);if("15m"===e)return n.getHours()+":"+n.getMinutes()}})},function(t,e,n){var r=n(0),o=n(4),i=n(5),a=n(1).PART;window.cl=console.log;var l=function(){var t=function(t){if(!window.Snap)throw new Error("Missing Snap.svg library !");this.calc=new o,this.chart=new i(t,this.calc)};return t.prototype.data=function(t){if(!(t instanceof Array))throw new Error("Missing library  data !");r.save(t),this.calc.start(),this.calc.main()},t.prototype.draw=function(t){switch(t){case a.axis:this.chart.drawAxis();break;case a.line:this.chart.drawLine();break;case a.candle:this.chart.drawCandle()}},t}();void 0!==t.exports?t.exports=l:window.Lines=l},function(t,e,n){function r(t){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function o(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}var i=n(0),a=n(2),l=n(1).config,c=function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t)}var e,n,c;return e=t,(n=[{key:"start",value:function(){this.init(),this.initSteps()}},{key:"init",value:function(){var t=i.get("data"),e={len:t.length,min:t[0],max:t[0],amplitude:0,zero:t[0]};t.forEach((function(t){e.min>t&&(e.min=t),e.max<t&&(e.max=t)})),e.amplitude=a.f(e.max-e.min),this.save(e)}},{key:"initSteps",value:function(){var t,e,n,r,o=i.mget(["area","amplitude","len","zero","min"]),l=o.area,c=o.amplitude,s=o.len,u=o.zero,f=o.min;t=a.f(l.width/s,0),e=a.f(l.height/c,0),n=l.zeroX,r=a.f(l.zeroY-(u-f)*e,0),this.save({stepX:t,stepY:e,zeroX:n,zeroY:r})}},{key:"main",value:function(){var t=i.mget(["data","zeroX","zeroY","len"]),e=t.data,n=t.zeroX,r=t.zeroY,o=t.len,a=i.mget(["stepX","stepY"]),l=a.stepX,c=a.stepY;i.push("points",[n,r]),this.tmp={data:e,stepX:l,stepY:c,lastX:n,lastY:r};for(var s=1;s<o;s++)this.calcPoint(s)}},{key:"calcPoint",value:function(t){var e=this.tmp.data[t-1],n=this.tmp.data[t];n<e?this.nextPoint(e-n,"plus"):n>e?this.nextPoint(n-e,"minus"):this.nextPoint(n,"equal")}},{key:"nextPoint",value:function(t,e){var n,r,o;n=this.tmp.lastX+this.tmp.stepX,o=t*this.tmp.stepY,r=this.tmp.lastY,"plus"===e?r+=o:"minus"===e?r-=o:"equal"===e&&(r=o),i.push("points",[n,r]),this.tmp.lastX=n,this.tmp.lastY=r}},{key:"yAxis",value:function(){var t=i.mget(["amplitude","area","min"]),e=t.amplitude,n=t.area,r=t.min,o=l.chart.totalGrids,c=a.f(e*(1/o),4);return{xAxis:n.zeroX,yAxis:n.zeroY,label:r,labelDiff:c}}},{key:"save",value:function(t){arguments.length>1&&void 0!==arguments[1]&&arguments[1],"object"===r(t)?i.mset(t):i.set()}},{key:"candleWidth",value:function(){var t=i.get("stepX"),e=l.chart.candleFill;l.chart.candleFill,console.log("..",t,e),i.set("candleWidth",t*e)}}])&&o(e.prototype,n),c&&o(e,c),t}();t.exports=c},function(t,e,n){function r(t){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function o(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function i(t,e){return!e||"object"!==r(e)&&"function"!=typeof e?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):e}function a(t,e,n){return(a="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(t,e,n){var r=function(t,e){for(;!Object.prototype.hasOwnProperty.call(t,e)&&null!==(t=l(t)););return t}(t,e);if(r){var o=Object.getOwnPropertyDescriptor(r,e);return o.get?o.get.call(n):o.value}})(t,e,n||t)}function l(t){return(l=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function c(t,e){return(c=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}var s=n(0),u=(n(2),n(1),function(t){function e(t,n){return function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e),i(this,l(e).call(this,t,n))}var n,r,u;return function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&c(t,e)}(e,t),n=e,(r=[{key:"init",value:function(){a(l(e.prototype),"init",this).call(this)}},{key:"drawCandle",value:function(){cl("draw Candle NOW ...:",s.all(),s.get("stepX"))}}])&&o(n.prototype,r),u&&o(n,u),e}(n(6)));t.exports=u},function(t,e,n){function r(t){return function(t){if(Array.isArray(t)){for(var e=0,n=new Array(t.length);e<t.length;e++)n[e]=t[e];return n}}(t)||function(t){if(Symbol.iterator in Object(t)||"[object Arguments]"===Object.prototype.toString.call(t))return Array.from(t)}(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}function o(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}var i=n(0),a=n(2);console.log("store : ",i);var l=n(1).config,c=function(){function t(e,n){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),window.getComputedStyle&&(this.el=this.getId(e),this.snap=window.Snap("#"+e),this.calc=n,this.init())}var e,n,c;return e=t,(n=[{key:"init",value:function(){var t=window.getComputedStyle(this.el),e=parseInt(t.width),n=parseInt(t.height);this.area={w:e,h:n,width:e-2*l.chart.padding,height:n-2*l.chart.padding,endX:e-l.chart.padding,zeroX:l.chart.padding,zeroY:n-l.chart.padding,offsetLeft:this.el.offsetLeft||this.el.parentElement.offsetLeft||0,offsetTop:this.el.offsetTop||this.el.parentElement.offsetTop||0,gridStep:a.f(n/l.chart.totalGrids,0)},i.set("area",this.area)}},{key:"drawAxis",value:function(){this.drawLabelsX(),this.drawLabelsY()}},{key:"drawLabelsX",value:function(){var t=this,e=i.mget(["labels","points"]),n=e.labels,r=e.points,o=Math.floor(this.area.zeroY+l.chart.padding/2);n.forEach((function(e,n){var i=r[n][0],l=a.fDate(e);t.svgText({xAxis:i,yAxis:o,label:l})}))}},{key:"drawLabelsY",value:function(){var t=this,e=l.chart,n=e.enableGrid,o=e.totalGrids,i=this.area,c=i.endX,s=i.gridStep,u=this.calc.yAxis(),f=u.xAxis,p=u.yAxis,d=u.label,h=u.labelDiff,y="";r(Array(o)).forEach((function(){t.svgText({xAxis:f,yAxis:p,label:d}),p-=s,d=a.f(d+h,5),n&&(y+=t.getPath([f,p],[c,p]))})),n&&this.svgPath(y,l.cssClass.grid)}},{key:"drawLine",value:function(){for(var t=i.mget(["points","len"]),e=t.points,n=0,r="",o=t.len-1;n<o;n++)r+=this.getPath(e[n],e[n+1]),this.debug(e[n]);this.svgPath(r)}},{key:"debug",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];this.snap.circle({cx:t[0],cy:t[1],r:3})}},{key:"getPath",value:function(t,e){var n="M".concat(Math.floor(t[0])," ").concat(Math.floor(t[1]));return n+="L".concat(Math.floor(e[0])," ").concat(Math.floor(e[1]))}},{key:"svgText",value:function(t){var e=t.xAxis,n=t.yAxis,r=t.label;this.snap.text(e-5,n,r)}},{key:"svgPath",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"stline";this.snap.path(t).attr({class:e})}},{key:"getId",value:function(t){return document.getElementById(t)}}])&&o(e.prototype,n),c&&o(e,c),t}();t.exports=c}])}));