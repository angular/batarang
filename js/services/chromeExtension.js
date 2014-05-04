// abstraction layer for Chrome Extension APIs
angular.module('panelApp').value('chromeExtension', {
  browserType: 'chrome',
  sendRequest: function (requestName, cb) {
    chrome.extension.sendRequest({
      script: requestName,
      tab: chrome.devtools.inspectedWindow.tabId
    }, cb || function () {});
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
    chrome.devtools.inspectedWindow.eval('(' +
      fn.toString() +
      '(window, ' +
      JSON.stringify(args) +
      '));', cb);
  },

  watchTargetTab: function (cb) {
    var port = chrome.extension.connect();
    port.postMessage({
      action: 'register',
      inspectedTabId: chrome.devtools.inspectedWindow.tabId
    });
    port.onMessage.addListener(function(msg) {
      if (msg === 'refresh') {
        cb();
      }
    });
    port.onDisconnect.addListener(function (a) {
      console.log(a);
    });
  }
});
