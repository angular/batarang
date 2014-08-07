
require('./bower_components/angular-loader/angular-loader.js');
require('angular-hint');
var eventProxyElement = document.getElementById('__ngDebugElement');

var customEvent = document.createEvent('Event');
customEvent.initEvent('myCustomEvent', true, true);

angular.hint.onMessage = function (data) {
  eventProxyElement.innerText = data;
  eventProxyElement.dispatchEvent(customEvent);
};
