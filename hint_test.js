describe('angularHint', function() {
  var $controller, $rootScope, hintService;

  beforeEach(module('ngHintUI'));
  beforeEach(inject(function(_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
  }));
  beforeEach(function() {
    hintService = {
      setHintFunction: function(funct) {
        this.onHint = funct;
      },
      setRefreshFunction: function(funct) {
        this.onRefresh = funct;
      }
    }
  });

  describe('on receiving a hint', function() {
    it('should give the hintService onHint a helpful function to format messages', function() {
      var scope = $rootScope.$new();
      var ctrl = $controller('HintController', {$scope: scope, hintService: hintService});
      expect(hintService.onHint.toString().indexOf("var result = msg.split('##')")).not.toEqual(-1);
    });


    it('should create message data arrays for each module', function() {
      var scope = $rootScope.$new();
      var ctrl = $controller('HintController', {$scope: scope, hintService: hintService});
      var aFakeMessage = 'Directives##You spelled ng-repeat wrong!##Error Messages';
      var aFakeMessage2 = 'Modules##You did not load a module!##Error Messages';
      hintService.onHint(aFakeMessage);
      hintService.onHint(aFakeMessage2);
      var expectedMessageData = {
        'Error Messages': ['You spelled ng-repeat wrong!'],
        'Warning Messages': [],
        'Suggestion Messages': [],
        'All Messages': [{
          'message': 'You spelled ng-repeat wrong!',
          'type': 'Error Messages'
        }]
      };
      var expectedMessageData2 = {
        'Error Messages': ['You did not load a module!'],
        'Warning Messages': [],
        'Suggestion Messages': [],
        'All Messages': [{
          'message': 'You did not load a module!',
          'type': 'Error Messages'
        }]
      };
      expect(scope.messageData['Directives']).toEqual(expectedMessageData);
      expect(scope.messageData['Modules']).toEqual(expectedMessageData2);
    });


    it('should create message data arrays for each type of message', function() {
      var scope = $rootScope.$new();
      var ctrl = $controller('HintController', {$scope: scope, hintService: hintService});
      var aFakeErrorMessage = 'Modules##You did not load a module!##Error Messages';
      var aFakeWarningMessage = 'Modules##You used a bad module name!##Warning Messages';
      var aFakeSuggestionMessage = 'Modules##Maybe you should not make modules.##Suggestion Messages';
      hintService.onHint(aFakeErrorMessage);
      hintService.onHint(aFakeWarningMessage);
      hintService.onHint(aFakeSuggestionMessage);

      var expectedMessageData = {
        'Error Messages': ['You did not load a module!'],
        'Warning Messages': ['You used a bad module name!'],
        'Suggestion Messages': ['Maybe you should not make modules.'],
        'All Messages': [
          {'message': 'You did not load a module!', 'type': 'Error Messages'},
          {'message': 'You used a bad module name!', 'type': 'Warning Messages'},
          {'message': 'Maybe you should not make modules.', 'type': 'Suggestion Messages'}
        ]
      };
      expect(scope.messageData['Modules']).toEqual(expectedMessageData);
    });


    it('should create an object to hold all recorded messages', function() {
      var scope = $rootScope.$new();
      var ctrl = $controller('HintController', {$scope: scope, hintService: hintService});
      var aFakeErrorMessage = 'Modules##You did not load a module!##Error Messages';
      var aFakeWarningMessage = 'Directives##Did you know you wrote ng-reepeet?##Warning Messages';
      var aFakeSuggestionMessage = 'Controllers##Maybe you should use a better name.##Suggestion Messages';
      hintService.onHint(aFakeErrorMessage);
      hintService.onHint(aFakeWarningMessage);
      hintService.onHint(aFakeSuggestionMessage);

      var expectedAllMessagesObject = {
        'Error Messages': ['You did not load a module!'],
        'Warning Messages': ['Did you know you wrote ng-reepeet?'],
        'Suggestion Messages': ['Maybe you should use a better name.'],
        'All Messages': [
          {'message': 'You did not load a module!', 'type': 'Error Messages', 'module': 'Modules'},
          {'message': 'Did you know you wrote ng-reepeet?', 'type': 'Warning Messages', 'module': 'Directives'},
          {'message': 'Maybe you should use a better name.', 'type': 'Suggestion Messages', 'module': 'Controllers'}
        ]
      };
      expect(scope.messageData['All']).toEqual(expectedAllMessagesObject);
    });
  });

  describe('onRefresh', function() {
    it('should use the hintService to clear the old messages on refresh', function() {
      var scope = $rootScope.$new();
      var ctrl = $controller('HintController', {$scope: scope, hintService: hintService});
      var aFakeErrorMessage = 'Modules##You did not load a module!##Error Messages';
      var aFakeWarningMessage = 'Directives##Did you know you wrote ng-reepeet?##Warning Messages';
      var aFakeSuggestionMessage = 'Controllers##Maybe you should use a better name.##Suggestion Messages';
      hintService.onHint(aFakeErrorMessage);
      hintService.onHint(aFakeWarningMessage);
      hintService.onHint(aFakeSuggestionMessage);

      var expectedAllMessagesObject = {
        'Error Messages': ['You did not load a module!'],
        'Warning Messages': ['Did you know you wrote ng-reepeet?'],
        'Suggestion Messages': ['Maybe you should use a better name.'],
        'All Messages': [
          {'message': 'You did not load a module!', 'type': 'Error Messages', 'module': 'Modules'},
          {'message': 'Did you know you wrote ng-reepeet?', 'type': 'Warning Messages', 'module': 'Directives'},
          {'message': 'Maybe you should use a better name.', 'type': 'Suggestion Messages', 'module': 'Controllers'}
        ]
      };

      expect(scope.messageData['All']).toEqual(expectedAllMessagesObject);

      hintService.onRefresh();
      var expectedRefreshData = {
        'Error Messages': [],
        'Warning Messages': [],
        'Suggestion Messages': [],
        'All Messages': []
      }
      expect(scope.messageData['All']).toEqual(expectedRefreshData);
    });
  });

  describe('setModule', function() {
    it('should to set the currently viewed module in the UI', function() {
      var scope = $rootScope.$new();
      var ctrl = $controller('HintController', {$scope: scope, hintService: hintService});
      scope.setModule('Directives');
      expect(scope.module).toEqual('Directives');
    });


    it('should be set to All by default', function() {
      var scope = $rootScope.$new();
      var ctrl = $controller('HintController', {$scope: scope, hintService: hintService});
      expect(scope.module).toEqual('All');
    });
  });

  describe('setType', function() {
    it('should set the type of message being viewed in the UI', function() {
      var scope = $rootScope.$new();
      var ctrl = $controller('HintController', {$scope: scope, hintService: hintService});
      scope.setType('Error Messages');
      expect(scope.type).toEqual('Error Messages');
    });


    it('should be set to All Messages by default', function() {
      var scope = $rootScope.$new();
      var ctrl = $controller('HintController', {$scope: scope, hintService: hintService});
      expect(scope.type).toEqual('All Messages');
    });
  });

  //TO DO CARLOS WHO WROTE THESE METHODS
  describe('message suppression', function() {
    describe('isSuppressed', function() {
      it('should detect if a message is currently suppressed', function() {
        //TO DO
      });
    });

    describe('suppressMessage', function() {
      it('should put a message into the list of suppressedMessages', function() {

      });
    });

    describe('unsuppressMessage', function() {
      it('should remove a message from the list of suppressedMessages', function() {

      });
    });
  });
});