if (document.cookie.indexOf('__ngDebug=true') != -1) {
  bootstrapHint();
}

function bootstrapHint () {
  chrome.extension.sendMessage('refresh');

  var html = document.getElementsByTagName('html')[0];

  var eventProxyElement = document.createElement('div');
  eventProxyElement.id = '__ngBatarangElement';
  eventProxyElement.style.display = 'none';
  html.appendChild(eventProxyElement);

  // inject into the application context from the content script context

  var script = window.document.createElement('script');
  script.src = chrome.extension.getURL('dist/hint.js');

  eventProxyElement.addEventListener('batarangDataEvent', function () {
    var eventData = eventProxyElement.innerText;
    chrome.extension.sendMessage(eventData);
  });

  html.setAttribute('ng-hint', '');

  html.appendChild(script);
}
