
// inject into the application context from the content script context


var script = window.document.createElement('script');
script.src = chrome.extension.getURL('hint.bundle.js');
var html = document.getElementsByTagName('html')[0];
html.setAttribute('ng-hint', '');

html.appendChild(script);
