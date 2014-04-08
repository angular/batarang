
// scopes need to be cached here so that if the devtools connects,
// the list of scopes can be immediately populated
// TODO: clear this on refresh ?
// appId --> { scopeName --> (key, value...) }
var scopeCache = {};

var scopeCacheEmpty = function () {
  return Object.keys(scopeCache).length;
};

// messages to be forwarded from content script to the devtools
var toForward = [
  'modelChange',
  'scopeChange',
  'scopeDeleted',
  'watcherChange',
  'watchPerfChange',
  'applyPerfChange'
];

chrome.extension.onConnect.addListener(function (port) {


  port.onMessage.addListener(function (msg) { // [devtools] --> [background]
    // notify of page refreshes
    if (msg.action === 'register') {
      chrome.tabs.onUpdated.addListener(respond);
      port.onDisconnect.addListener(function () {
        chrome.tabs.onUpdated.removeListener(respond);
      });

      function respond (tabId, changeInfo, tab) {
        if (tabId === msg.inspectedTabId) {
          port.postMessage('refresh'); // [background] --> [devtools]
          delete scopeCache[msg.appId]; // clear cache
        }
      }

      if (!scopeCache[msg.appId]) {
        scopeCache[msg.appId] = {};
      }

      // immediately populate the scopes tree from the cache
      Object.keys(scopeCache[msg.appId]).forEach(function (scopeId) {
        port.postMessage({      // [background] --> [devtools]
          action: 'scopeChange',
          scope: scopeCache[msg.appId][scopeId],
          scopeId: scopeId
        });
      });

    }
  });

  // [content script] --> [background] --> [devtools]
  chrome.extension.onMessage.addListener(function (msg) {
    if (toForward.indexOf(msg.action) !== -1) {
      port.postMessage(msg);
    }
  });


});

chrome.extension.onMessage.addListener(function (msg, sender) {
  if (msg.action === 'scopeChange') {
    scopeCache[msg.appId] = scopeCache[msg.appId] || {};
    scopeCache[msg.appId][msg.id] = msg.scope;
  }
});
