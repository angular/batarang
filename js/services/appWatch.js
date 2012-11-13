// Service for running code in the context of the application being debugged
panelApp.factory('appWatch', function (chromeExtension) {

  var _watchCache = {};

  // Public API
  // ==========
  return {

    getWatchTree: function (id, callback) {
      chromeExtension.eval("function (window, args) {" +
        "return window.__ngDebug.getWatchTree(args.id);" +
      "}", {id: id}, function (tree) {
        if (tree) {
          _watchCache[id] = tree;
        }
        callback(_watchCache[id]);
      });
    }

  };
});
