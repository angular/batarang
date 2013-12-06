describe('inject', function () {

  // inject/debug bootstraps asynchronously
  beforeEach(function () {});

  it('should expose a __ngDebug object to window', function () {
    expect(window.__ngDebug).not.toBeUndefined();
  });

  describe('getRootScopeIds', function () {

    it('should start empty', function () {
      expect(__ngDebug.getRootScopeIds()).toEqual([]);
    });

    describe('bootstraped', function () {
      it('should work', function () {
        var elt, scope;

        runs(function () {
          angular.module('foo', []).controller('A', function ($scope) {
            $scope.model = 1;
            $scope.complexModel = { foo: { bar: 'baz' } };
          });
          elt = angular.element('<div ng-app="foo" ng-controller="A"></div>');
          angular.bootstrap(elt, ['ng', 'foo']);
          scope = elt.data().$scope;
        });

        runs(function () {
          expect(__ngDebug.getRootScopeIds().length).toBe(1);
          expect(__ngDebug.getModel(scope.$id).model).toBe(scope.model);
        });

        runs(function () {
          scope.model = 2;
          scope.$digest();
          expect(__ngDebug.getModel(scope.$id).model).toBe(2);
        });

        runs(function () {
          __ngDebug.watchModel(scope.$id, 'complexModel');
          scope.$digest();
        });

        waits(60);

        runs(function () {
          scope.complexModel.b = 1;
          scope.$digest();
        });
      });
    });


  });
});
