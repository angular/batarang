/*
 * Batarang instrumentation
 *
 * This gets loaded into the context of the app you are inspecting
 */
require('./loader.js');
require('angular-hint');

angular.hint.onAny(function (event, data, severity) {
  // EventEmitter2 usually omits the event type for the argument list (assigning it to `this.event`
  // instead), but under certain circumstances it may include it.
  if (this.event !== event) {
    severity = data;
    data = event;
    event = this.event;
  }

  window.postMessage({
    __fromBatarang: true,
    module: event.split(':')[0],
    event: event,
    data: data,
    severity: severity
  }, '*');
});
