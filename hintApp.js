angular.module('ngHintUI', []).

controller('HintController', ['$scope', 'hintService',
  function($scope, hintService) {

    //Set the hint service to perform this action when the page is refreshed
    hintService.onRefresh(function() {
      $scope.messageData = {
        'All' : {
          'Error Messages': [],
          'Warning Messages': [],
          'Suggestion Messages': [],
          'All Messages': []
        }
      };
    });

    //Set the hint service to perform this action whenever
    //a new hint message is received.
    hintService.onHint(function(msg) {
      //If there is no scope data, initialize a new data object
      $scope.messageData = $scope.messageData || {
        'All' : {
          'Error Messages': [],
          'Warning Messages': [],
          'Suggestion Messages': [],
          'All Messages': []
        }
      };

      // Split the hint message into useful information
      var result      = msg.split('##'),
          modName     = result[0],
          message     = result[1],
          messageType = result[2];

      //If there are no messages for this module, make new arrays for this module's messages
      if(!$scope.messageData[modName]) {
        $scope.messageData[modName] = {
          'Error Messages': [],
          'Warning Messages': [],
          'Suggestion Messages': [],
          'All Messages': []
        };
      }

      $scope.messageData['All']['All Messages'].push({
        message: message,
        type: messageType,
        module: modName
      });

      if(!$scope.messageData['All'][messageType]) {
        $scope.messageData['All'][messageType] = [];
      }
      $scope.messageData['All'][messageType].push(message);
      $scope.messageData[modName]['All Messages'].push({message: message, type: messageType});
      $scope.messageData[modName][messageType].push(message);
    });

    $scope.suppressedMessages = {};
    $scope.suppressedMessagesLength = 0;

    $scope.labels = ['All Messages', 'Error Messages', 'Warning Messages', 'Suggestion Messages'];

    $scope.setModule = function(module) {
      $scope.module = module;
    };

    $scope.setType = function(type) {
      $scope.type = type;
    };

    $scope.setModule('All');
    $scope.setType('All Messages');

    $scope.isSuppressed = function(message) {
      message = message.split(' ').slice(6,9).join('');
      return message in $scope.suppressedMessages;
    };

    $scope.suppressMessage = function(message) {
      $scope.suppressedMessagesLength++;

      var key = message.split(' ').slice(6,9).join('');
      var secondSpace = message.indexOf(' ', message.indexOf(' '));
      var endInd = 60;
      while(message.charAt(endInd) !== ' ') {
        endInd++;
        if(endInd > 75) {
          break;
        }
      }
      $scope.suppressedMessages[key] = '...' + message.substr(secondSpace+1,endInd) + '...';
    };

    $scope.unsuppressMessage = function(messageKey) {
      $scope.suppressedMessagesLength--;

      delete $scope.suppressedMessages[messageKey];
    };

}]).

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
        onHintCallback(msg);
      }
    });
  });

  port.onDisconnect.addListener(function (a) {
    console.log(a);
  });

}]);

