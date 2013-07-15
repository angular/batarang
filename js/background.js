
// notify of page refreshes
chrome.extension.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    if (msg.action === 'register') {
      var respond = function (tabId, changeInfo, tab) {
        if (tabId !== msg.inspectedTabId) {
          return;
        }
        port.postMessage('refresh');
      };

      chrome.tabs.onUpdated.addListener(respond);
      port.onDisconnect.addListener(function () {
        chrome.tabs.onUpdated.removeListener(respond);
      });
    }
  });

  chrome.extension.onMessage.addListener(function (msg) {
    if (msg.action === 'modelChange' || msg.action === 'scopeChange') {
      port.postMessage(msg);
    }
  });
});

