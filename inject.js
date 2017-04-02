if (document.cookie.indexOf('__ngDebug=true') !== -1) {
  bootstrapHint();
}

function bootstrapHint () {
  chrome.runtime.sendMessage('refresh');

  var html = document.documentElement;

  // inject into the application context from the content script context
  var script = document.createElement('script');
  script.src = chrome.runtime.getURL('dist/hint.js');

  window.addEventListener('message', function (evt) {
    // There's no good way to verify the provenance of the message.
    // evt.source === window is true for all messages sent from
    // the main frame. evt.origin is going to be the webpage's origin,
    // even if the message originated from a chrome:// script you injected.

    // The only thing we can do is see if the message *looks* like something
    // we would send, cross our fingers, and send it on.
    // Thus, we check for one of the properties known to be on *all* of our
    // messages (__fromBatarang === true).

    var eventData = evt.data;
    if (eventData && typeof eventData === 'object' && eventData.__fromBatarang) {
      chrome.runtime.sendMessage(eventData);
    }
  });

  html.setAttribute('ng-hint', '');
  html.appendChild(script);
}
