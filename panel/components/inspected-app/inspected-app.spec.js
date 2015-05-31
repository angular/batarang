'use strict';

describe('inspectedApp', function() {
  var inspectedApp, rootScope, port;

  beforeEach(function() {
    module('batarang.inspected-app')
    window.chrome = createMockChrome();
    inject(function(_inspectedApp_, _$rootScope_) {
      inspectedApp = _inspectedApp_;
      rootScope = _$rootScope_;
      spyOn(rootScope, '$broadcast');
    });
  });

  describe('when instantiated', function () {
    it('should post a message with the inspected tabId', function () {
      expect(port.postMessage).
          toHaveBeenCalledWith(window.chrome.devtools.inspectedWindow.tabId);
    });
  });

  describe('messaging', function () {
    var $browser;
    beforeEach(function(){
      inject(function(_$browser_) {
        $browser = _$browser_;
      });
    });

    function triggerAndFlush(object){
      port.onMessage.trigger(JSON.stringify(object));
      $browser.defer.flush();
    }

    it('should track hints', function () {
      var hint = { isHint: true };
      triggerAndFlush(hint);

      expect(inspectedApp.hints).toEqual([hint]);
    });

    it('should hydrate the model', function () {
      var scopes = { 1: 'a', 2: 'b' },
          hints = [ 'h1',  'h2' ];
      triggerAndFlush({ event: 'hydrate', data: { scopes: scopes, hints: hints } });

      expect(inspectedApp.scopes[1]).toEqual(scopes[1]);
      expect(inspectedApp.scopes[2]).toEqual(scopes[2]);
      expect(inspectedApp.hints[0]).toEqual(hints[0]);
      expect(inspectedApp.hints[1]).toEqual(hints[1]);
    });

    it('should track new scopes', function () {
      var id = 1, parentId = 2;
      inspectedApp.scopes[parentId] = { children: [] };
      triggerAndFlush({ event: 'scope:new', data: { child: id, parent: parentId } });

      expect(inspectedApp.scopes[id]).toEqual({ parent: parentId, children: [], models: {} });
      expect(inspectedApp.scopes[parentId].children).toEqual([ id ]);
    });

    it('should track new scopes without throwing exception when parent scope not present', function () {
      var id = 1, parentId = 2;
      port.onMessage.trigger({ event: 'scope:new', data: { child: id, parent: parentId } });

      expect($browser.defer.flush).not.toThrow();
      expect(inspectedApp.scopes[id]).toEqual({ parent: parentId, children: [], models: {} });
    });

    it('should track destruction of scopes without throwing error when parent scope not present', function () {
      var id = 1;
      inspectedApp.scopes[id] = true;
      port.onMessage.trigger({ event: 'scope:destroy', data: { id: id } });

      expect($browser.defer.flush).not.toThrow();
      expect(inspectedApp.scopes.hasOwnProperty(id)).toBeFalsy();
    });

    it('should track model changes', function () {
      var id = 1;
      inspectedApp.scopes[id] = { models: {} };

      triggerAndFlush({
        event: 'model:change',
        data: {
          id: id,
          path: '',
          value: '"jsonHere"'
        }
      });

      expect(inspectedApp.scopes[id].models['']).toEqual("jsonHere");
    });

    it('should track model changes without throwing exception when values are missing', function () {
      var id = 1;
      inspectedApp.scopes[id] = { models: { '': true} };
      expect(inspectedApp.scopes[id].models['']).toBeTruthy();
      port.onMessage.trigger(JSON.stringify({
        event: 'model:change',
        data: {
          id:id,
          path: ''
        }
      }));

      expect($browser.defer.flush).not.toThrow();
      expect(inspectedApp.scopes[id].models['']).toBeUndefined();
    });

    it('should track updates to scope descriptors', function () {
      port.onMessage.trigger(JSON.stringify({ event: 'scope:new', data: { child: 1 } }));
      triggerAndFlush({ event: 'scope:link', data: { id: 1, descriptor: 'pasta' }});

      expect(inspectedApp.scopes[1].descriptor).toBe('pasta');
    });

    it('should broadcast message from $rootScope', function () {
      var message = { event: 'scope:new', data: { child: 1 } };
      triggerAndFlush(message);

      expect(rootScope.$broadcast).toHaveBeenCalledWith(message.event, message.data);
    });
  });

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


  describe('inspectScope', function () {
    it('should call chrome devtools APIs', function() {
      inspectedApp.inspectScope(2);
      expect(chrome.devtools.inspectedWindow.eval).toHaveBeenCalledWith('angular.hint.inspectScope(2,"")');
    });
  });

  function createMockChrome() {
    return {
      extension: {
        connect: function () {
          return port = createMockSocket();
        }
      },
      devtools: {
        inspectedWindow: {
          tabId: 1,
          eval: jasmine.createSpy('inspectedWindowEval')
        }
      }
    };
  }
});

function createListenerSpy(name) {
  var symbol = '_' + name;

  var listener = {
    addListener: function (fn) {
      listener[symbol].push(fn);
    },
    removeListener: function (fn) {
      listener[symbol].splice(fn, 1);
    },
    trigger: function () {
      var args = arguments;
      listener[symbol].forEach(function (fn) {
        fn.apply(listener, args);
      });
    }
  };

  listener[symbol] = [];
  return listener;
}

function createMockSocket() {
  return {
    onMessage: createListenerSpy('messageFunction'),
    postMessage: jasmine.createSpy('postMessageFunction'),
    onDisconnect: createListenerSpy('onDisconnect')
  };
}
