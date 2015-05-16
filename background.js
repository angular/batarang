
// tabId -> devtool port
var inspectedTabs = {};

// tabId -> buffered data
var data = {};

function bufferOrForward(message, sender) {
  var tabId = sender.tab.id,
      devToolsPort = inspectedTabs[tabId];

  if (!data[tabId] || message === 'refresh') {
    resetState(tabId);

    // TODO: this is kind of a hack-y spot to put this
    showPageAction(tabId);
  }

  if (message !== 'refresh') {
    bufferData(tabId, message);
  }
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

  var hintables = [
    'Controllers',
    'general',
    'Modules',
    'Events'
  ];

  if (hintables.indexOf(message.module) > -1) {
    tabData.hints.push(message);
  }

  if (message.event === 'scope:new') {
    tabData.scopes[message.data.child] = {
      parent: message.data.parent,
      children: [],
      models: {}
    };
    if (tabData.scopes[message.data.parent]) {
      tabData.scopes[message.data.parent].children.push(message.data.child);
    }
  } else if (message.data.id && (scope = tabData.scopes[message.data.id])) {
    if (message.event === 'scope:destroy') {
      if (scope.parent) {
        scope.parent.children.splice(scope.parent.children.indexOf(child), 1);
      }
      delete scopes[message.data.id];
    } else if (message.event === 'model:change') {
      scope.models[message.data.path] = (typeof message.data.value === 'undefined') ?
                                            undefined : message.data.value;
    } else if (message.event === 'scope:link') {
      scope.descriptor = message.descriptor;
    }
  }

  // TODO: Handle digest timings
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


function showPageAction(tabId) {
  chrome.pageAction.show(tabId);
  chrome.pageAction.setTitle({
    tabId: tabId,
    title: 'Batarang Active'
  });
}
