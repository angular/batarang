// Broadcast poll events
angular.module('panelApp', []).

run(function ($rootScope, appContext) {

  // todo: kill this
  setInterval(function () {
    $rootScope.$broadcast('poll');
  }, 500);

  var port = chrome.extension.connect();

  port.onMessage.addListener(function (msg) {
    if (msg === 'refresh') {
      $rootScope.$apply(function () {
        $rootScope.$broadcast('refresh');
      });
    } else if (msg.action) {
      $rootScope.$apply(function () {
        $rootScope.$broadcast(msg.action, msg);
      });
    }
  });

  appContext.getAppId(function (id) {
    port.postMessage({
      action: 'register',
      appId: id,
      inspectedTabId: chrome.devtools.inspectedWindow.tabId
    });
  });

});
