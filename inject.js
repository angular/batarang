


// inject into the application context from the content script context

var inject = function () {
  var script = window.document.createElement('script');
  script.innerHTML = '(' + instument.toString() + '(window))';
  document.head.appendChild(script);

};

// handle forwarding the events sent from the app context to the
// background page context
// var eventProxyElement = document.getElementById('__ngDebugElement');

// if (eventProxyElement) {
//   eventProxyElement.addEventListener('myCustomEvent', function () {
//     var eventData = JSON.parse(eventProxyElement.innerText);
//     chrome.extension.sendMessage(eventData);
//   });
//   document.removeEventListener('DOMContentLoaded', inject);
// }


// only inject if cookie is set
if (document.cookie.indexOf('__ngDebug=true') != -1) {
  document.addEventListener('DOMContentLoaded', inject);
}
