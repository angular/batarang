angular.module('ngHintUI').
  service('hintService', function() {
    var onHintFunction;

    this.setHintFunction = function(hintFunction) {
      onHintFunction = hintFunction;
    }

    this.getHintFunction = function() {
      return onHintFunction;
    }

    var port = chrome.extension.connect();
    port.postMessage(chrome.devtools.inspectedWindow.tabId);
    port.onMessage.addListener(function(msg) {
      if(msg == 'refresh') {
        this.messageData = [];
        return;
      }
      onHintFunction(msg);
    });

    port.onDisconnect.addListener(function (a) {
      console.log(a);
    });
});