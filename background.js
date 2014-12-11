var buffer = [];
function addToBuffer(message) {
  buffer.push(message);
}
chrome.runtime.onMessage.addListener(addToBuffer);
chrome.runtime.onConnect.addListener(function(devToolsPort) {
  chrome.runtime.onMessage.removeListener(addToBuffer);
  buffer.forEach(function(msg) {
    devToolsPort.postMessage(msg);
  });
  buffer = [];

  devToolsPort.onMessage.addListener(function(inspectedTabId) {
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
      if(tabId === inspectedTabId && changeInfo.status === 'loading') {
        devToolsPort.postMessage('refresh');
      }
    });
  });
  // context script –> background
  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    devToolsPort.postMessage(msg);
  });
});
