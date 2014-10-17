require('./loader.js');
require('angular-hint');
var eventProxyElement = document.getElementById('__ngDebugElement');

var customEvent = document.createEvent('Event');
customEvent.initEvent('myCustomEvent', true, true);

angular.hint.onMessage = function (moduleName, message, messageType) {
  if (!message) {
    message = moduleName;
    moduleName = 'Unknown'
  }
  if (typeof messageType === 'undefined') {
    messageType = 1;
  }
  eventProxyElement.innerText = JSON.stringify({
    module: moduleName,
    message: message,
    severity: messageType
  });
  eventProxyElement.dispatchEvent(customEvent);
};
