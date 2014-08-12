angular.module('ngHintUI',[]);

angular.module('ngHintUI')
  .controller('HintCtrl', ['$scope', '$timeout',
    function($scope, $timeout){
      $scope.module, $scope.type;
      var currentPromises;
      //message data will be an array sent from hint log to batarang to here

      // connect to background page
      var port = chrome.extension.connect();
      port.postMessage(chrome.devtools.inspectedWindow.tabId);
      port.onMessage.addListener(function(msg) {
        if(msg == 'refresh') {
          $scope.messageData = {};
          return;
        }

        $scope.messageData = $scope.messageData || {};
        var result = msg.split('##'); //[modName, message, messageType]
        if(!$scope.messageData[result[0]]) {
          $scope.messageData[result[0]] = {
            'Error Messages': [],
            'Warning Messages': [],
            'Suggestion Messages': []
          };
        }
        $scope.messageData[result[0]][result[2]].push(result[1]);
        debounceUpdateAll();
      });
      port.onDisconnect.addListener(function (a) {
        console.log(a);
      });


      $scope.labels = ['All Messages', 'Error Messages', 'Warning Messages', 'Suggestion Messages'];

      function updateAll(){
        var all = {
          'All Messages': [],
          'Error Messages': [],
          'Warning Messages': [],
          'Suggestion Messages': []
        };
        for(var id in $scope.messageData) {
          $scope.messageData[id]['All Messages'] = [];
          for(var type in $scope.messageData[id]) {
            $scope.messageData[id][type].forEach(function(message) {
              if(type !== 'All Messages'){
                all['All Messages'].push({message: message, type: type, module: id});
                all[type].push(message);
                $scope.messageData[id]['All Messages'].push({message: message, type: type});
              }
            });
          }
        }
        $scope.messageData['All'] = all;
        $scope.$apply();
      }

      function debounceUpdateAll(){
        $timeout.cancel(currentPromises);
        currentPromises = $timeout(function() {
          updateAll()
        }.bind(this),1000)
      }
      $scope.setModule = function(module) {
        $scope.module = module;
      }
      $scope.setType = function(type) {
        $scope.type = type;
      }
      $scope.setModule('Directives');
      $scope.setType('All Messages');

  }]);
