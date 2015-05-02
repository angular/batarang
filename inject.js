if (document.cookie.indexOf('__ngDebug=true') != -1) {
  bootstrapHint();
}

function bootstrapHint () {
  chrome.extension.sendMessage('refresh');

  var html = document.getElementsByTagName('html')[0];

  // inject into the application context from the content script context
  var script = window.document.createElement('script');
  script.src = chrome.extension.getURL('dist/hint.js');

  window.addEventListener('message', function (evt) {
    // We only accept messages from ourselves
    if (event.source !== window) {
      return;
    }
    chrome.extension.sendMessage(evt.data);
  });

  html.setAttribute('ng-hint', '');

  html.appendChild(script);
}
