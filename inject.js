if (document.cookie.indexOf('__ngDebug=true') != -1) {
  bootstrapHint();
}

function bootstrapHint () {
  chrome.runtime.sendMessage('refresh');

  var html = document.getElementsByTagName('html')[0];

  // inject into the application context from the content script context
  var script = window.document.createElement('script');
  script.src = chrome.extension.getURL('dist/hint.js');

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
    // NOTE: Check for null before checking for the property, since typeof null === 'object'.
    if (typeof eventData === 'object' && eventData !== null && eventData.hasOwnProperty('__fromBatarang') && eventData.__fromBatarang) {
      chrome.runtime.sendMessage(eventData);
    }
  });

  html.setAttribute('ng-hint', '');

  html.appendChild(script);
}
