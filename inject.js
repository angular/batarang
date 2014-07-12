
// inject into the application context from the content script context

var inject = function () {
  var script = window.document.createElement('script');
  script.src = chrome.extension.getURL('hint.bundle.js');
  document.head.appendChild(script);
};

// only inject if cookie is set
if (document.cookie.indexOf('__ngDebug=true') != -1) {
  document.addEventListener('DOMContentLoaded', inject);
}
