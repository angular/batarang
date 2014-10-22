describe('inspectedApp', function() {
  var inspectedApp;

  beforeEach(module('batarang.inspected-app'));
  beforeEach(function() {
    window.chrome = createMockChrome();
  });
  beforeEach(inject(function(_inspectedApp_) {
    inspectedApp = _inspectedApp_;
  }));

  describe('watch', function () {
    it('should call chrome devtools APIs', function() {
      inspectedApp.watch(1, '');
      expect(chrome.devtools.inspectedWindow.eval).toHaveBeenCalledWith('angular.hint.watch(1,"")');
    });
  });

  describe('unwatch', function () {
    it('should call chrome devtools APIs', function() {
      inspectedApp.unwatch(1, '');
      expect(chrome.devtools.inspectedWindow.eval).toHaveBeenCalledWith('angular.hint.unwatch(1,"")');
    });
  });

});

function createMockChrome() {
  return {
    extension: {
      connect: createMockSocket
    },
    devtools: {
      inspectedWindow: {
        tabId: 1,
        eval: jasmine.createSpy('inspectedWindowEval')
      }
    }
  };
}

function createListenerSpy(name) {
  return {
    addListener: jasmine.createSpy(name)
  };
}

function createMockSocket() {
  return {
    onMessage: createListenerSpy('messageFunction'),
    postMessage: jasmine.createSpy('postMessageFunction'),
    onDisconnect: createListenerSpy('onDisconnect')
  };
}