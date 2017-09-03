(function () {
  var counter = 1000;

  
  window.svgToCanvas = function() {
    var _imgElem;
    _imgElem = document.querySelector('img');
    _imgElem.src = svg.toBase64();

    setTimeout(function() {
      document.querySelector('canvas').getContext('2d').drawImage(_imgElem, 0, 0);
    }, 10);
  };

 window.changePeriod = function (elem) {
    var liElems, liArray, boldElem = elem.style.fontWeight;

    // convert NodeElements into Array and loop through with forEach 
    liElems = document.getElementsByClassName("navHrefPeriod");
    liArray = [].slice.call(liElems); // convert to Array
    liArray.forEach(function (el) {
      el.style.fontWeight = "";
    });

    elem.style.fontWeight = (boldElem) ? "" : "bold";

    svg.timeUnit = elem.innerHTML;
    if (!boldElem) {
      svg.data(_data2).draw(3).drawCandles();
    } else {
      svg.data(_data).draw(3).drawCandles();
    }
  };


  window.toggleChart = function (elem, type) {
    var liElems, liArray, boldElem = elem.style.fontWeight;

    // convert NodeElements into Array and loop through with forEach 
    liElems = document.getElementsByClassName("navHrefType");
    liArray = [].slice.call(liElems); // convert to Array
    liArray.forEach(function (el) {
      el.style.fontWeight = "";
    });

    elem.style.fontWeight = (boldElem) ? "" : "bold";

    if (!boldElem) {
      svg.hide(type);
    } else {
      svg.show(type);
    }
  };


  function fxjson(jsonList) {
    var json = [], arrOrder = ["open", "high", "low", "close"], one = [];
    for (var i in jsonList) {
      if (jsonList[i][arrOrder[0]] && jsonList[i][arrOrder[1]] && jsonList[i][arrOrder[2]] && jsonList[i][arrOrder[3]]) {
        json.push([jsonList[i][arrOrder[0]], jsonList[i][arrOrder[1]], jsonList[i][arrOrder[2]], jsonList[i][arrOrder[3]]]);
      }
    }
    return json;
  }

  function reqListener() {
    // var fxdata, jsonList = JSON.parse(this.responseText);
    // fxdata = fxjson(jsonList);
    var _data = [
      [28.7, 28.05, 28.45, 30.04],
      [30.04, 30.13, 28.3, 29.63],
      [30.04, 33.13, 28.3, 29.63],
      [30.04, 30.13, 28.3, 29.63],
      [30.04, 30.13, 28.3, 29.63],
      [30.13, 30.13, 30.13, 30.13],
      [30.13, 30.13, 30.13, 30.13],
      [30.13, 30.13, 30.13, 30.13],
      [30.04, 30.13, 28.3, 29.63],
      [29.89, 29.89, 29.89, 29.89],
      [29.89, 29.89, 29.89, 29.89],
      [29.89, 29.89, 29.89, 29.89],
      [29.89, 29.89, 29.89, 29.89],
      [30.13, 30.13, 30.13, 30.13],
      [30.13, 30.13, 30.13, 30.13],
      [30.04, 30.13, 28.3, 29.63],
      [29.89, 29.89, 29.89, 29.89],
      [29.89, 29.89, 29.89, 29.89],
      [29.89, 29.89, 29.89, 29.89],
      [29.89, 29.89, 29.89, 29.89],
      [29.62, 31.79, 29.62, 31.02]];

    window.svg = new Lines("svgBox");
    svg.data(_data);
    svg.draw();
  }
reqListener();

  function request(urlCnt, cb) {
    var _cb, oReq, _url;
    _cb = cb || reqListener;
    oReq = new XMLHttpRequest();
    _url = "http://fxlines.com/pairs/usdjpy/30m/";
    _url += urlCnt || "800";

    oReq.addEventListener("load", _cb);
    oReq.open("GET", _url);
    oReq.send();
  }

////////start
  // request();

  function getid(elementId) {
    return document.getElementById(elementId);
  }

  getid("goNext").addEventListener("click", function (ev) {
    counter -= 50;
    console.log(counter);
    svg.clear();
    request(counter);
    ev.preventDefault();
  });

  getid("goPrev").addEventListener("click", function (ev) {
    counter += 50;
    console.log(counter);
    svg.clear();
    request(counter);
    ev.preventDefault();
  });

  getid("showNavigation").addEventListener("click", function (ev) {
    var navElem = getid("navBar");
    ev.preventDefault()
    if (navElem.className === "hidd") {
      navElem.className = "";
    } else {
      navElem.className = "hidd";
    }
  });

  // getid("svgBox").addEventListener('mousewheel',function(event) {
  //   var delta;

  //   delta = event.wheelDelta ? event.wheelDelta : (-1 * event.deltaY);

  //   console.log("mouse scroll ...", event.wheelDelta, event.deltaY, delta)
  //   event.preventDefault();
  //   if (delta > 0) {
  //     svg.stepX += 5;
  //   } else {
  //     svg.stepX -= 5;

  //   }
  //   svg.points = [];
  //   delete svg._prevY;
  //   svg.calcPoints();
  //   svg.draw(2)
  // });

})();
