
// tabId -> devtool port
var inspectedTabs = {};

// TODO: keep track of app state here
// tabId -> list of buffered events
var buffer = {};

function bufferOrForward(message, sender) {
  var tabId = sender.tab.id,
      devToolsPort = inspectedTabs[tabId];

  if (devToolsPort) {
    devToolsPort.postMessage(message);
  }
  if (!buffer[tabId] || message === 'refresh') {
    resetState(tabId);
  }
  buffer[tabId].push(message);
}

// context script –> background
chrome.runtime.onMessage.addListener(bufferOrForward);

chrome.runtime.onConnect.addListener(function(devToolsPort) {

  devToolsPort.onMessage.addListener(registerInspectedTabId);

  function registerInspectedTabId(inspectedTabId) {
    inspectedTabs[inspectedTabId] = devToolsPort;

    if (!buffer[inspectedTabId]) {
      resetState(inspectedTabId);
    }
    buffer[inspectedTabId].forEach(function(msg) {
      devToolsPort.postMessage(msg);
    });

    devToolsPort.onDisconnect.addListener(function () {
      delete inspectedTabs[inspectedTabId];
    });

    //devToolsPort.onMessage.removeListener(registerInspectedTabId);
  }

});

function resetState(tabId) {
  buffer[tabId] = [];
}
