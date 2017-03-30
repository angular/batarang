
// tabId -> devtool port
var inspectedTabs = {};

// tabId -> buffered data
var data = {};

var runtimeMessage = createRxFrom(chrome.runtime.onMessage, messageSelector);
var runtimeConnect = createRxFrom(chrome.runtime.onConnect);
var tabsRemoved = createRxFrom(chrome.tabs.onRemoved);

runtimeMessage.forEach(brokerMessage);
runtimeConnect.forEach(onConnect);
tabsRemoved.forEach(onTabsRemoved);

function brokerMessage(event) {
  var message = event.message;
  var sender = event.sender;
  var tabId = sender.tab.id;
  var devToolsPort = inspectedTabs[tabId];

  if (!data[tabId] || message === 'refresh') {
    resetState(tabId);

    // TODO: this is kind of a hack-y spot to put this
    showPageAction(tabId);
  }

  if (message !== 'refresh') {
    transformMessage(tabId, message);
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

function transformMessage(tabId, message) {
  var scopes = data[tabId].scopes;
  var hintables = [
    'Controllers',
    'general',
    'Modules',
    'Events'
  ];
  message.isHint = (hintables.indexOf(message.module) > -1);

  if (message.event === 'scope:destroy') {
    message.data.subTree = getSubTree(scopes, message.data.id);
  }

  if (message.event === 'model:change') {
    message.data.value = (typeof message.data.value === 'undefined') ?
        undefined : JSON.parse(message.data.value)
  }
}

function getSubTree(scopes, id){
  var subTree = [id], scope;
  for (var i = 0; i < subTree.length; i++) {
    if (scope = scopes[subTree[i]]) {
      subTree.push.apply(subTree, scope.children);
    }
  }
  return subTree;
}

function bufferData(tabId, message) {
  var tabData = data[tabId],
      scope;

  if (message.isHint) {
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
        var parentScope = tabData.scopes[scope.parent];
        parentScope.children.splice(parentScope.children.indexOf(message.data.id), 1);
      }
      for (var i = 0; i < message.data.subTree.length; i++) {
        delete tabData.scopes[message.data.subTree[i]];
      }
    } else if (message.event === 'model:change') {
      scope.models[message.data.path] = message.data.value;
    } else if (message.event === 'scope:link') {
      scope.descriptor = message.data.descriptor;
    }
  }

  // TODO: Handle digest timings
}

function onConnect(devToolsPort) {
  var devToolsMessage = createRxFrom(devToolsPort.onMessage);
  devToolsMessage.forEach(registerInspectedTabId.bind(null, devToolsPort));
  return event;
}

function registerInspectedTabId(devToolsPort, inspectedTabId) {
  inspectedTabs[inspectedTabId] = devToolsPort;

  if (!data[inspectedTabId]) {
    resetState(inspectedTabId);
  }
  devToolsPort.postMessage({
    event: 'hydrate',
    data: data[inspectedTabId]
  });

  var devToolsDisconnect = createRxFrom(devToolsPort.onDisconnect);
  devToolsDisconnect.forEach(onDisconnect);
  return event;
}

function onDisconnect(inspectedTabId) {
  delete inspectedTabs[inspectedTabId];
}

function onTabsRemoved(tabId) {
  if (data[tabId]) {
    delete data[tabId];
  }
}

function showPageAction(tabId) {
  chrome.pageAction.show(tabId);
  chrome.pageAction.setTitle({
    tabId: tabId,
    title: 'Batarang Active'
  });
}

function createRxFrom(target, selector) {
  return Rx.Observable.fromEventPattern(
    function(handler) { target.addListener(handler); },
    function(handler) { target.removeListener(handler); },
    selector
  );
}

function messageSelector() {
  return {
    message: arguments[0],
    sender: arguments[1],
    sendResponse: arguments[2]
  };
}
