angular.module('ngHintUI', []).

controller('HintController', ['$scope', 'hintService', HintController]).

service('hintService', ['$rootScope', function($rootScope) {
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

}]);

function HintController($scope, hintService) {

  resetMessageData();

  // TODO: rename this ?
  hintService.onRefresh(resetMessageData);

  function resetMessageData() {
    $scope.hints = [];
  }

  //Set the hint service to perform this action whenever
  //a new hint message is received.
  hintService.onHint(function(hint) {
    $scope.hints.push(hint);
  });
}
