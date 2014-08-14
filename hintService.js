angular.module('ngHintUI').
  service('hintService', function() {
    var onHintFunction, onRefreshFunction;

    this.setHintFunction = function(hintFunction) {
      onHintFunction = hintFunction;
    }

    this.getHintFunction = function() {
      return onHintFunction;
    }

    this.setRefreshFunction = function(refreshFunction) {
      onRefreshFunction = refreshFunction;
    }

    this.getRefreshFunction = function() {
      return onRefreshFunction;
    }

    var port = chrome.extension.connect();
    port.postMessage(chrome.devtools.inspectedWindow.tabId);
    port.onMessage.addListener(function(msg) {
      msg == 'refresh' ? onRefreshFunction() : onHintFunction(msg);
    });

    port.onDisconnect.addListener(function (a) {
      console.log(a);
    });
});