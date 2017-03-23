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

  describe('processing of model data', function() {
    it('should handle an element of an array being supplied before the array itself', function () {
      $rootScope.data = {
        '': {
          arrayA: { '~array-length': 1 }
        },
        'arrayA[0]': { hello: 'world' },
        'arrayA': [
          { '~object': true }
        ]
      };
      compileAndExpectOutputToEqual('arrayA: 0: hello: "world"');
    });

    it('should handle an element of an array being supplied after the array itself', function () {
      $rootScope.data = {
        '': {
          arrayA: { '~array-length': 1 }
        },
        'arrayA': [
          { '~object': true }
        ],
        'arrayA[0]': { hello: 'world' }
      };
      compileAndExpectOutputToEqual('arrayA: 0: hello: "world"');
    });

    it('should handle an object member being supplied after the object itself', function () {
      $rootScope.data = {
        '': {
          objectA: { '~object': true }
        },
        objectA: {
          objectB: { '~object': true }
        },
        'objectA.objectB': { hello: 'world' }
      };
      compileAndExpectOutputToEqual('objectA: objectB: hello: "world"');
    });

    it('should handle an object member being supplied before the object itself', function () {
      $rootScope.data = {
        '': {
          objectA: { '~object': true }
        },
        'objectA.objectB': { hello: 'world' },
        objectA: {
          objectB: { '~object': true }
        }
      };
      compileAndExpectOutputToEqual('objectA: objectB: hello: "world"');
    });

    it('should handle the root element being supplied first', function () {
      $rootScope.data = {
        '': {
          objectA: { '~object': true }
        },
        objectA: {
          hello: 'world'
        }
      };
      compileAndExpectOutputToEqual('objectA: hello: "world"');
    });

    it('should handle the root element being supplied after another element', function () {
      $rootScope.data = {
        objectA: {
          hello: 'world'
        },
        '': {
          objectA: { '~object': true }
        }
      };
      compileAndExpectOutputToEqual('objectA: hello: "world"');
    });
  });

  describe('expanded css', function() {
    var modelWithObject = {
      '': {
        '$id': 1,
        objectA: { '~object': true }
      }
    };
    it('should not add expanded class to object that is not expanded', function () {
      $rootScope.data = modelWithObject;
      compileTree();
      expect(element[0].querySelectorAll('.expanded').length).toEqual(0);
    });

    it('should add expanded class to object that is expanded', function () {
      setupTreeWithModelAndExpandIt();
      expect(element[0].querySelector('.parent.expanded')).toBeTruthy();
    });

    it('should clear the history of expanded elements when model changes', function () {
      setupTreeWithModelAndExpandIt();
      $rootScope.data = {
        '': {
          '$id': 1,
          objectA: {'~object': true}
        }
      };
      $rootScope.$digest();

      expect(element[0].querySelector('.parent.expanded')).toBeNull();
    });

    function setupTreeWithModelAndExpandIt(){
      $rootScope.data = modelWithObject;
      compileTree();
      angular.element(element[0].querySelector('.parent')).triggerHandler('click');
      $rootScope.$broadcast('model:change', { id: 1 });
    }
  });

  function compileAndExpectOutputToEqual(expected) {
    compileTree();
    expect(element.text()).toEqual(expected);
  }

  function compileTree() {
    element = compile('<bat-json-tree bat-model="data"></bat-json-tree>');
    $rootScope.$apply();
  }

  function compile(template) {
    return $compile(template)($rootScope);
  }
});
