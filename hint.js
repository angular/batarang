/*
 * Batarang instrumentation
 *
 * This gets loaded into the context of the app you are inspecting
 */
require('./loader.js');
require('angular-hint');

angular.hint.onAny(function (data, severity) {
  window.postMessage({
    module: this.event.split(':')[0],
    event: this.event,
    data: data,
    severity: severity
  }, '*');
});
