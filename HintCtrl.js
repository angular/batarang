angular.module('ngHintUI',[]);

angular.module('ngHintUI')
  .controller('HintCtrl', ['$scope', '$timeout',
    function($scope, $timeout){
      $scope.module, $scope.type, $scope.isEmpty = '';
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

      // $scope.messageData = {
      //   'Modules': {
      //     'Error-Messages': ['qwer$scope is a message', 'So issdfs $scope', 'Dont forget asdfsbout me too'],
      //     'Warning-Messages': ['$scope is sdfa message', 'So iqws $scope', 'Dontasdf forget about me too'],
      //     'Suggestion-Messages': ['$scope meerqessage', 'So is thsdgsis', 'Dont foasdfrget asdfabout me too'],
      //   },
      //   'Directives': {
      //     'Error-Messages': ['rty$scope is asdfnot message', 'So ishggh $scope, not', 'Dont forgedfh abohkhut me too, jk'],
      //     'Warning-Messages': ['$scope not mqweressage', 'So is $scope, not', 'Dont forget abfghfout me too, jk'],
      //     'Suggestion-Messages': ['$scope is not masdessage', 'So is thiddfss, not', 'Dont forget abohmgut me too, jk'],
      //   },
      // };

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
        $scope.isEmpty = '';
        if($scope.messageData && $scope.messageData[$scope.module][type].length === 0) {
          $scope.isEmpty = 'There are no messages in this category.';
        }
        $scope.type = type;
      }
      $scope.setModule('Directives');
      $scope.setType('All Messages');

  }]);