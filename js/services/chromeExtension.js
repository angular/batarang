// abstraction layer for Chrome Extension APIs
angular.module('panelApp').

value('chromeExtension', {
  sendRequest: function (requestName, cb) {
    chrome.extension.sendRequest({
      script: requestName,
      tab: chrome.devtools.inspectedWindow.tabId
    }, cb || function () {});
  },

  // evaluates in the context of a window
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
  }
});
