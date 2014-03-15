describe('elements panel', function() {
  beforeEach(module(function($provide) {
    $provide.factory('chromeExtension', createChromeExtensionMock);
  }));

  afterEach(function() {
    $0 = null;
  });


  describe('angular properties sidebar', function() {
    describe('getPanelContents()', function() {
      it('should return properties for scope of selected element', inject(function($rootScope) {
        var element = angular.element('<div><p>Hello, world</p></div>');
        element.data('$scope', $rootScope);
        $rootScope.text = "Hello, world!";
        $0 = element[0];
        expect (getPanelContents().text).toBe("Hello, world!");
        $0 = element.children().eq(0)[0];
        expect (getPanelContents().text).toBe("Hello, world!");
      }));


      it('should cross shadow DOM barrier via DocumentFragment#host', inject(function($rootScope) {
        var parent = document.createElement('div'),
            fragment = document.createDocumentFragment(),
            child = document.createElement('p');
        fragment.host = parent;
        fragment.appendChild(child);
        parent.appendChild(fragment);

        parent = angular.element(parent);
        parent.data('$scope', $rootScope);
        $rootScope.text = "Fragmented fun for everyone";

        $0 = child;
        expect(getPanelContents().text).toBe("Fragmented fun for everyone");
      }));
    });
  });
});
