'use strict';

angular.module('batarang.inspected-app', []).
  service('inspectedApp', ['$rootScope', inspectedAppService]);

function inspectedAppService($rootScope) {

  // TODO: maybe state should live elsewhere
  var scopes = this.scopes = {},
      hints = this.hints = [];

  this.watch = function (scopeId, path) {
    return invokeAngularHintMethod('watch', scopeId, path);
  };

  this.unwatch = function (scopeId, path) {
    return invokeAngularHintMethod('unwatch', scopeId, path);
  };

  function invokeAngularHintMethod(method, scopeId, path) {
    var args = [parseInt(scopeId, 10), path || ''].map(JSON.stringify).join(',');
    chrome.devtools.inspectedWindow.eval('angular.hint.' + method + '(' + args + ')');
  }

  var port = chrome.extension.connect();
  port.postMessage(chrome.devtools.inspectedWindow.tabId);
  port.onMessage.addListener(function(msg) {
    $rootScope.$applyAsync(function () {
      if (msg === 'refresh') {
        onRefreshMessage();
      } else {
        var hint = JSON.parse(msg);
        onHintMessage(hint);
      }
    });
  });
  port.onDisconnect.addListener(function (a) {
    console.log(a);
  });

  function onHintMessage(hint) {
    if (hint.message) {
      hints.push(hint);
    } else if (hint.event === 'model:change') {
      scopes[hint.id].models[hint.path] = (typeof hint.value === 'undefined') ?
                                            undefined : JSON.parse(hint.value);
    } else if (hint.event === 'scope:new') {
      addNewScope(hint);
    } else if (hint.event === 'scope:link') {
      scopes[hint.id].descriptor = hint.descriptor;
    }

    if (hint.event) {
      $rootScope.$broadcast(hint.event, hint);
    }

    console.log(hint);
  }

  function onRefreshMessage() {
    hints.length = 0;
  }

  function addNewScope (hint) {
    scopes[hint.child] = {
      parent: hint.parent,
      children: [],
      models: {}
    };
    if (scopes[hint.parent]) {
      scopes[hint.parent].children.push(hint.child);
    }
  }

}
