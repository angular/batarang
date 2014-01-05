// watchers tree
angular.module('panelApp').directive('batWatcherTree', function($compile, composingQueue) {

  // make toggle settings persist across $compile
  var scopeState = {};

  //show only several first and last scopes - for big lists it is useless to see all items, at least on performance tab
  //TODO: add ability to see all (if someone needs it)
  var showFirstChildren = 25, showLastChildren = 25, needToBreak = showFirstChildren + showLastChildren + 2;

  return {
    restrict: 'E',
    terminal: true,
    scope: {
      val: '=val',
      inspect: '=inspect'
    },
    link: function (scope, element, attrs) {
      var level = parseInt(attrs.level || "1");
      // this is more complicated then it should be
      // see: https://github.com/angular/angular.js/issues/898
      element.append(
        '<div class="scope-branch" ng-cloak>' +
          '<a href ng-click="inspect()">Scope ({{val.id}})</a> | ' +
          '<a href ng-click="scopeState[val.id] = !scopeState[val.id]">toggle</a>' +
          '<div ng-hide="scopeState[val.id]">' +
            '<ul>' +
              '<li ng-repeat="item in val.watchers">' +
                '<a href ng-hide="item.split(\'\n\').length < 2" ng-click="showState = !showState">toggle</a> ' +
                '<code ng-hide="showState && item.split(\'\n\').length > 1">{{item | first}}</code>' +
                '<pre ng-hide="!showState || item.split(\'\n\').length < 2">' +
                  '{{item}}' +
                '</pre>' +
              '</li>' +
            '</ul>' +
            '<ng-switch on="val.children.length >= ' + needToBreak + '">' +

              '<div ng-switch-when="true">' +
                '<div ng-repeat="child in val.children | limitTo:' + showFirstChildren + '">' +
                  '<bat-watcher-tree val="child" inspect="inspect" level="' + (level + 1) + '"></bat-watcher-tree>' +
                '</div>' +
                '<div class="ellipsis"> {{val.children.length - ' + (needToBreak-1) + '}} scope(s) skipped  </div>' +
                '<div ng-repeat="child in val.children | limitTo:-' + showLastChildren + '">' +
                  '<bat-watcher-tree val="child" inspect="inspect" level="' + (level + 1) + '"></bat-watcher-tree>' +
                '</div>' +
              '</div>' +
              '<div ng-switch-default>' +
                '<div ng-repeat="child in val.children">' +
                  '<bat-watcher-tree val="child" inspect="inspect" level="' + (level + 1) + '"></bat-watcher-tree>' +
                '</div>' +
              '</div>' +
            '</ng-switch>' +

          '</div>' +
        '</div>');

      var childScope = scope.$new();
      childScope.scopeState = scopeState;

      //compose tree in background, otherwise UI freezes for long
      composingQueue.addToQueue(function() {
        $compile(element.contents())(childScope);
      });

    }
  };
});
