/*
 * Batarang instrumentation
 *
 * This gets loaded into the context of the app you are inspecting
 */
require('./loader.js');
require('angular-hint');

angular.hint.onMessage = function (moduleName, message, messageType, category) {
  if (!message) {
    message = moduleName;
    moduleName = 'Unknown'
  }
  if (typeof messageType === 'undefined') {
    messageType = 1;
  }
  sendMessage({
    module: moduleName,
    message: message,
    severity: messageType,
    category: category
  });
};

angular.hint.emit = function (ev, data) {
  data.event = ev;
  sendMessage(data);
};

function sendMessage (obj) {
  window.postMessage(obj, '*');
}
