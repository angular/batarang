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

  function compileTree() {
    element = compile('<bat-json-tree bat-model="data"></bat-json-tree>');
    $rootScope.$apply();
  }

  function compile(template) {
    return $compile(template)($rootScope);
  }
});
