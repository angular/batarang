'use strict';

angular.module('batarang.inspected-app', []).
  service('inspectedApp', ['$rootScope', '$q', inspectedAppService]);

function inspectedAppService($rootScope, $q) {

  // TODO: maybe state should live elsewhere
  var scopes = this.scopes = {},
      hints = this.hints = [];

  this.watch = function (scopeId, path) {
    return invokeAngularHintMethod('watch', scopeId, path);
  };

  this.unwatch = function (scopeId, path) {
    return invokeAngularHintMethod('unwatch', scopeId, path);
  };

  this.assign = function (scopeId, path, value) {
    return invokeAngularHintMethod('assign', scopeId, path, value);
  };

  this.enableInstrumentation = function (setting) {
    setting = !!setting;
    chrome.devtools.inspectedWindow.eval(
      "(function () {" +
        "var prev = document.cookie.indexOf('__ngDebug=true') !== -1;" +
        "if (prev !== " + setting + ") {" +
          "window.document.cookie = '__ngDebug=" + setting + ";';" +
          "window.document.location.reload();" +
        "}" +
      "}())"
    );
  };

  this.getInstrumentationStatus = function () {
    return $q(function(resolve, reject) {
      chrome.devtools.inspectedWindow.eval(
          "document.cookie.indexOf('__ngDebug=true') !== -1", resolve);
    });
  };

  /*
   * sets window.$scope to the scope of the given id
   */
  this.inspectScope = function (scopeId) {
    return invokeAngularHintMethod('inspectScope', scopeId);
  };

  function invokeAngularHintMethod(method, scopeId, path, value) {
    var args = [parseInt(scopeId, 10), path || ''].
                  map(JSON.stringify).
                  concat(value ? [value] : []).
                  join(',');

    chrome.devtools.inspectedWindow.eval('angular.hint.' + method + '(' + args + ')');
  }

  var port = chrome.extension.connect();
  port.postMessage(chrome.devtools.inspectedWindow.tabId);
  port.onMessage.addListener(function(msg) {
    $rootScope.$applyAsync(function () {
      if (msg === 'refresh') {
        onRefreshMessage();
      } else if (typeof msg === 'string') {
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
    } else if (hint.event) {
      if (hint.event === 'scope:new') {
        addNewScope(hint);
      } else if (hint.id && scopes[hint.id]) {
        if (hint.event === 'model:change') {
          scopes[hint.id].models[hint.path] = (typeof hint.value === 'undefined') ?
                                                undefined : JSON.parse(hint.value);
        } else if (hint.event === 'scope:link') {
          scopes[hint.id].descriptor = hint.descriptor;
        }
      }
      $rootScope.$broadcast(hint.event, hint);
    }
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
