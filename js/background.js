
// scopes need to be cached here so that if the devtools connects,
// the list of scopes can be immediately populated
// TODO: clear this on refresh ?
var scopeCache = {};

var scopeCacheEmpty = function () {
  return Object.keys(scopeCache).length;
};

// messages to be forwarded from content script to the devtools
var toForward = [
  'modelChange',
  'scopeChange',
  'watcherChange',
  'watchPerfChange',
  'applyPerfChange'
];

chrome.extension.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    // notify of page refreshes
    if (msg.action === 'register') {
      chrome.tabs.onUpdated.addListener(respond);
      port.onDisconnect.addListener(function () {
        chrome.tabs.onUpdated.removeListener(respond);
      });

      function respond (tabId, changeInfo, tab) {
        if (tabId === msg.inspectedTabId) {
          port.postMessage('refresh');
        }
      }
    }
  });

  chrome.extension.onMessage.addListener(function (msg) {
    if (toForward.indexOf(msg.action) !== -1) {
      port.postMessage(msg);
    }
  });

  // immediately populate the scopes tree from the cache

  // TODO: how do we know that the cache refers to the
  // tab that we're connected to?
  Object.keys(scopeCache).forEach(function (scopeId) {
    port.postMessage({
      action: 'scopeChange',
      scope: scopeCache[scopeId],
      scopeId: scopeId
    });
  });

});

chrome.extension.onMessage.addListener(function (msg) {
  if (msg.action === 'scopeChange') {
    scopeCache[msg.id] = msg.scope;
  }
});