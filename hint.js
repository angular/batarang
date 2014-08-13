require('./loader.js');
require('angular-hint');
var eventProxyElement = document.getElementById('__ngDebugElement');

var customEvent = document.createEvent('Event');
customEvent.initEvent('myCustomEvent', true, true);

angular.hint.onMessage = function (moduleName, message, messageType) {
  eventProxyElement.innerText = moduleName+'##'+message+'##'+messageType;
  eventProxyElement.dispatchEvent(customEvent);
};
