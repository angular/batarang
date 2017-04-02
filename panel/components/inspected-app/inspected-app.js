'use strict';

angular.module('batarang.inspected-app', []).
  service('inspectedApp', ['$rootScope', '$q', InspectedAppService]);

function InspectedAppService($rootScope, $q) {

  var scopes = this.scopes = {},
      hints = this.hints = [],
      perf = this.perf = [];

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
          "document.cookie = '__ngDebug=" + setting + ";';" +
          "document.location.reload();" +
        "}" +
      "}())"
    );
  };

  this.getInstrumentationStatus = function () {
    return $q(function (resolve) {
      chrome.devtools.inspectedWindow.eval(
          "document.cookie.indexOf('__ngDebug=true') !== -1", resolve);
    });
  };

  // Sets window.$scope to the scope of the given id
  this.inspectScope = function (scopeId) {
    return invokeAngularHintMethod('inspectScope', scopeId);
  };

  function invokeAngularHintMethod(method, scopeId, path, value) {
    var args = [scopeId, path || ''].
                  map(JSON.stringify).
                  concat(value ? [value] : []).
                  join(',');

    chrome.devtools.inspectedWindow.eval('angular.hint.' + method + '(' + args + ')');
  }

  var port = chrome.runtime.connect();
  port.postMessage(chrome.devtools.inspectedWindow.tabId);
  port.onMessage.addListener(function (msg) {
    $rootScope.$applyAsync(function () {
      if (msg === 'refresh') {
        onRefreshMessage();
        $rootScope.$broadcast('refresh');
      } else {
        if (typeof msg === 'string') {
          msg = JSON.parse(msg);
        }
        onHintMessage(msg);
      }
    });
  });
  port.onDisconnect.addListener(function () {
    console.log('Disconnected from tab ' + chrome.devtools.inspectedWindow.tabId + '.');
  });

  function onHintMessage(message) {
    if (message.isHint) {
      hints.push(message);
    } else if (message.event) {
      if (message.event === 'hydrate') {
        Object.keys(message.data.scopes).forEach(function (scopeId) {
          scopes[scopeId] = message.data.scopes[scopeId];
        });
        message.data.hints.forEach(function (hint) {
          hints.push(hint);
        });
      } else if (message.event === 'scope:new') {
        addNewScope(message);
      } else if (message.data.id && scopes[message.data.id]) {
        var scopeId = message.data.id;
        var scope = scopes[scopeId];

        if (message.event === 'scope:destroy') {
          var parentScope = scopes[scope.parent];
          if (parentScope) {
            parentScope.children.splice(parentScope.children.indexOf(scopeId), 1);
          }

          for (var i = 0; i < message.data.subTree.length; i++) {
            delete scopes[message.data.subTree[i]];
          }
        } else if (message.event === 'model:change') {
          scope.models[message.data.path] = message.data.value;
        } else if (message.event === 'scope:link') {
          scope.descriptor = message.data.descriptor;
        } else if (message.event === 'scope:digest') {
          // Hack to avoid reference shenanigans
          perf[0] = message.data;
        }
      }

      $rootScope.$broadcast(message.event, message.data);
    }
  }

  function onRefreshMessage() {
    clear(scopes);
    hints.length = 0;
  }

  function addNewScope (message) {
    var childId = message.data.child;
    var parentId = message.data.parent;

    scopes[childId] = {
      parent: parentId,
      children: [],
      models: {}
    };

    if (scopes[parentId]) {
      scopes[parentId].children.push(childId);
    }
  }

  function clear (obj) {
    Object.keys(obj).forEach(function (key) {
      delete obj[key];
    });
  }

}
