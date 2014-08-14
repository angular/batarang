describe('hintService', function() {
  var hintService;

  beforeEach(module('ngHintUI'));
  beforeEach(inject(function(_hintService_) {
    hintService = _hintService_;
  }));

  var messageFunction = {
    addListener: jasmine.createSpy('messageFunction')
  }
  var postMessageFunction = jasmine.createSpy('postMessageFunction');
  var onDisconnectFunction = {
    addListener: jasmine.createSpy('onDisconnect')
  }
  chrome = {
    extension: {
      connect: function() {
        return {
          onMessage: messageFunction,
          postMessage: postMessageFunction,
          onDisconnect: onDisconnectFunction
        };
      }
    },
    devtools: {
      inspectedWindow: {
        tabId: 1
      }
    }
  };

  it('should set the function to be executed for each hint', function() {
    var onHintFunction = function() {
      console.log('Do this when passed a hint.');
    };
    hintService.setHintFunction(onHintFunction);
    expect(hintService.getHintFunction()).toEqual(onHintFunction);
  });


  it('should set the function to be executed on a refresh', function() {
    var onRefreshFunction = function() {
      console.log('Do this when the page is refreshed.');
    };
    hintService.setRefreshFunction(onRefreshFunction);
    expect(hintService.getRefreshFunction()).toEqual(onRefreshFunction);
  });
});
