'use strict';

angular.module('ngHintUI', []).
  controller('HintController', ['$scope', 'hintService', HintController]).
  service('hintService', ['$rootScope', hintService]);

function HintController($scope, hintService) {
  resetMessageData();

  hintService.onRefresh(resetMessageData);

  function resetMessageData() {
    $scope.hints = [];
  }

  hintService.onHint(function(hint) {
    $scope.hints.push(hint);
  });
}

function hintService($rootScope) {
  var onHintCallback,
      onRefreshCallback;

  this.onHint = function(cb) {
    onHintCallback = cb;
  };

  this.onRefresh = function(cb) {
    onRefreshCallback = cb;
  };

  var port = chrome.extension.connect();
  port.postMessage(chrome.devtools.inspectedWindow.tabId);
  port.onMessage.addListener(function(msg) {
    $rootScope.$apply(function () {
      if (msg === 'refresh') {
        onRefreshCallback();
      } else {
        var hint = JSON.parse(msg);
        onHintCallback(hint);
      }
    });
  });

  port.onDisconnect.addListener(function (a) {
    console.log(a);
  });
}
