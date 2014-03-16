var devtools = {
  inspectedWindow: {
    _replyCbMap: new Map(),
    _watchRefreshCb: null,
    tabId: "FakeTabID",
    _request: function (requestName, cb, data) {
      var id = Math.random().toString();
      var req = {
        id: id,
        requestName: requestName,
        data: data
      };
      if (cb) {
        this._replyCbMap.set(id, cb);
      }
      window.parent.postMessage(req, "*");
    },
    sendRequest: function (requestName, cb, data) {
      console.log("SEND REQUEST", arguments);
    },
    watchRefresh: function (cb) {
      //console.log("WATCH REFRESH", arguments);
      this._watchRequest = cb;
    },
    eval: function (code, cb) {
      this._request("target-eval", cb, { code: code });
    }
  }
};

// NOTE: hook missing legacy calls
var chrome = { devtools: devtools };

window.addEventListener("message", function (evt) {
  //console.log("RECEIVE", evt);
  var replyCbMap = devtools.inspectedWindow._replyCbMap;
  var watchRefreshCb = devtools.inspectedWindow._watchRefreshCb;
  if (evt.data.type === "refresh" && watchRefreshCb) {
    watchRefreshCb(evt.data);
    return;
  }

  if (evt.data.id) {
    var id = evt.data.id;
    var cb = replyCbMap.get(id);
    replyCbMap.delete(id);

    if (cb) {
      cb(evt.data.reply);
      return;
    }
  }
}, false);


// abstraction layer for Firefox Extension APIs
angular.module('panelApp').value('chromeExtension', {
  browserType: 'firefox',

  sendRequest: function (requestName, cb) {
    devtools.inspectedWindow.sendRequest(requestName, cb);
  },

  // evaluates in the context of a window
  //written because I don't like the API for chrome.devtools.inspectedWindow.eval;
  // passing strings instead of functions are gross.
  eval: function (fn, args, cb) {
    // with two args
    if (!cb && typeof args === 'function') {
      cb = args;
      args = {};
    } else if (!args) {
      args = {};
    }
    devtools.inspectedWindow.eval('JSON.stringify(' +
      fn.toString() +
      '(window, ' +
      JSON.stringify(args) +
      '));', cb);
  },

  watchTargetTab: function (cb) {
    devtools.inspectedWindow.watchRefresh(cb);
  }
});
