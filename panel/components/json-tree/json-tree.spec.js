'use strict';

describe('batJsonTree', function () {

  var $compile, $rootScope, element;

  beforeEach(module('batarang.json-tree'));
  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('should not throw on an undefined model', function () {
    expect(compileTree).not.toThrow();
  });

  it('should render a simple model', function () {
    $rootScope.data = {
      '': { '$id': 1 }
    };
    compileTree();
    expect(element.text()).toBe('$id: 1');
  });

  describe('model:change event', function() {
    it('should render model again when parameter has same id as model', function () {
      $rootScope.data = {
        '': {'$id': 1}
      };
      compileTree();
      $rootScope.data = {
        '': {'$id': 2}
      };
      $rootScope.$broadcast('model:change', { id: 2 });
      $rootScope.$apply();
      expect(element.text()).toBe('$id: 2');
    });

    it('should not render model again when parameter has different id than model', function () {
      $rootScope.data = {
        '': {'$id': 1}
      };
      compileTree();
      $rootScope.$broadcast('model:change', { id: 2 });
      $rootScope.$apply();
      expect(element.text()).toBe('$id: 1');
    });

    it('should not throw error if model undefined', function () {
      $rootScope.data = undefined;
      compileTree();
      expect(function () {
        $rootScope.$broadcast('model:change', { id: 2 });
      }).not.toThrow();
    });

    it("should not throw error if '' property not set on model", function () {
      $rootScope.data = {};
      compileTree();
      expect(function () {
        $rootScope.$broadcast('model:change', { id: 2 });
      }).not.toThrow();
    });
  });

  function compileTree() {
    element = compile('<bat-json-tree bat-model="data"></bat-json-tree>');
    $rootScope.$apply();
  }

  function compile(template) {
    return $compile(template)($rootScope);
  }
});
