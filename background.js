
// tabId -> devtool port
var inspectedTabs = {};

// tabId -> buffered data
var data = {};

function bufferOrForward(message, sender) {
  var tabId = sender.tab.id,
      devToolsPort = inspectedTabs[tabId];

  if (!data[tabId] || message === 'refresh') {
    resetState(tabId);
  }

  // TODO: not sure how I feel about special-casing `refresh`
  if (message !== 'refresh') {
    message = JSON.parse(message);
  }

  bufferData(tabId, message);
  if (devToolsPort) {
    devToolsPort.postMessage(message);
  }
}

function resetState(tabId) {
  data[tabId] = {
    hints: [],
    scopes: {}
  };
}

function bufferData(tabId, message) {
  var tabData = data[tabId],
      scope;

  if (message.message) {
    return tabData.hints.push(message);
  }

  if (message.event) {
    if (message.event === 'scope:new') {
      tabData.scopes[message.child] = {
        parent: message.parent,
        children: [],
        models: {}
      };
      if (tabData.scopes[message.parent]) {
        tabData.scopes[message.parent].children.push(message.child);
      }
    } else if (message.id && (scope = tabData.scopes[message.id])) {
      if (message.event === 'scope:destroy') {
        if (scope.parent) {
          scope.parent.children.splice(scope.parent.children.indexOf(child), 1);
        }
        delete scopes[message.id];
      } else if (message.event === 'model:change') {
        scope.models[message.path] = (typeof message.value === 'undefined') ?
                                              undefined : JSON.parse(message.value);
      } else if (message.event === 'scope:link') {
        scope.descriptor = message.descriptor;
      }
    }
  }
}

// context script –> background
chrome.runtime.onMessage.addListener(bufferOrForward);

chrome.runtime.onConnect.addListener(function(devToolsPort) {

  devToolsPort.onMessage.addListener(registerInspectedTabId);

  function registerInspectedTabId(inspectedTabId) {
    inspectedTabs[inspectedTabId] = devToolsPort;

    if (!data[inspectedTabId]) {
      resetState(inspectedTabId);
    }
    devToolsPort.postMessage({
      event: 'hydrate',
      data: data[inspectedTabId]
    });

    devToolsPort.onDisconnect.addListener(function () {
      delete inspectedTabs[inspectedTabId];
    });

    //devToolsPort.onMessage.removeListener(registerInspectedTabId);
  }

});

chrome.tabs.onRemoved.addListener(function (tabId) {
  if (data[tabId]) {
    delete data[tabId];
  }
});
