
var ng = angular.module('ng');
ng.config(function ($provide) {
  // methods to patch

  // $provide.provider
  var temp = $provide.provider;
  $provide.provider = function (name, definition) {
    if (!definition) {
      angular.forEach(name, function (definition, name) {
        var tempGet = definition.$get;
        definition.$get = function () {
          recordDependencies(name, annotate(tempGet));
          return tempGet.apply(this, arguments);
        };
      });
    } else if (definition instanceof Array) {
      // it is a constructor with array syntax
      var tempConstructor = definition[definition.length - 1];

      definition[definition.length - 1] = function () {
        recordDependencies(name, annotate(tempConstructor));
        return tempConstructor.apply(this, arguments);
      };
    } else if (definition.$get instanceof Array) {
      // it should have a $get
      var tempGet = definition.$get[definition.$get.length - 1];

      definition.$get[definition.$get.length - 1] = function () {
        recordDependencies(name, annotate(tempGet));
        return tempGet.apply(this, arguments);
      };
    } else if (typeof definition === 'object') {
      // it should have a $get
      var tempGet = definition.$get;

      // preserve original annotations
      definition.$get = annotate(definition.$get);
      definition.$get.push(function () {
        recordDependencies(name, annotate(tempGet));
        return tempGet.apply(this, arguments);
      });
    } else {
      recordDependencies(name, annotate(definition));
    }
    return temp.apply(this, arguments);
  };

  // $provide.(factory|service)
  [
    'factory',
    'service'
  ].forEach(function (met) {
    var temp = $provide[met];
    $provide[met] = function (name, definition) {
      if (typeof name === 'object') {
        angular.forEach(name, function (value, key) {
          var isArray = value instanceof Array;
          var originalValue = isArray ? value[value.length - 1] : value;

          var newValue = function () {
            recordDependencies(key, annotate(originalValue));
            return originalValue.apply(this, arguments);
          };

          if (isArray) {
            value[value.length - 1] = newValue;
          } else {
            name[value] = newValue;
          }
        });
      } else {
        recordDependencies(name, annotate(definition));
      }
      return temp.apply(this, arguments);
    };
  });

  $provide.decorator('$rootScope', function ($delegate) {

    var watchFnToHumanReadableString = function (fn) {
      if (fn.exp) {
        return fn.exp.trim();
      }
      if (fn.name) {
        return fn.name.trim();
      }
      return fn.toString();
    };

    var applyFnToLogString = function (fn) {
      var str;
      if (fn) {
        if (fn.name) {
          str = fn.name;
        } else if (fn.toString().split('\n').length > 1) {
          str = 'fn () { ' + fn.toString().split('\n')[1].trim() + ' /* ... */ }';
        } else {
          str = fn.toString().trim().substr(0, 30) + '...';
        }
      } else {
        str = '$apply';
      }
      return str;
    };


    // patch registering watchers
    // ==========================

    var _watch = $delegate.__proto__.$watch;
    $delegate.__proto__.$watch = function (watchExpression, applyFunction) {
      var thatScope = this;
      var watchStr = watchFnToHumanReadableString(watchExpression);

      if (!debug.watchPerf[watchStr]) {
        debug.watchPerf[watchStr] = {
          time: 0,
          calls: 0
        };
      }
      if (!debug.watchers[thatScope.$id]) {
        debug.watchers[thatScope.$id] = [];
      }
      debug.watchers[thatScope.$id].push(watchStr);
      emit.watcherChange(thatScope.$id);

      // patch watchExpression
      // ---------------------
      var w = watchExpression;
      if (typeof w === 'function') {
        watchExpression = function () {
          var start = performance.now();
          var ret = w.apply(this, arguments);
          var end = performance.now();
          debug.watchPerf[watchStr].time += (end - start);
          debug.watchPerf[watchStr].calls += 1;
          emit.watchPerfChange(watchStr);
          return ret;
        };
      } else {
        watchExpression = function () {
          var start = performance.now();
          var ret = thatScope.$eval(w);
          var end = performance.now();
          debug.watchPerf[watchStr].time += (end - start);
          debug.watchPerf[watchStr].calls += 1;
          emit.watchPerfChange(watchStr);
          return ret;
        };
      }

      // patch applyFunction
      // -------------------
      if (typeof applyFunction === 'function') {
        var applyStr = applyFunction.toString();
        var unpatchedApplyFunction = applyFunction;
        applyFunction = function () {
          var start = performance.now();
          var ret = unpatchedApplyFunction.apply(this, arguments);
          var end = performance.now();

          //TODO: move these checks out of here and into registering the watcher
          if (!debug.applyPerf[applyStr]) {
            debug.applyPerf[applyStr] = {
              time: 0,
              calls: 0
            };
          }
          debug.applyPerf[applyStr].time += (end - start);
          debug.applyPerf[applyStr].calls += 1;
          emit.applyPerfChange(applyStr);
          return ret;
        };
      }

      return _watch.apply(this, arguments);
    };


    // patch $destroy
    // --------------
    var _destroy = $delegate.__proto__.$destroy;
    $delegate.__proto__.$destroy = function () {
      [
        'watchers',
        'scopes'
      ].forEach(function (prop) {
        if (debug[prop][this.$id]) {
          delete debug[prop][this.$id];
        }
      }, this);
      emit.scopeDeleted(this.$id);
      return _destroy.apply(this, arguments);
    };


    // patch $new
    // ----------
    var _new = $delegate.__proto__.$new;
    $delegate.__proto__.$new = function () {

      var ret = _new.apply(this, arguments);
      if (ret.$root) {
        debug.rootScopes[ret.$root.$id] = ret.$root;
        emit.scopeChange(ret.$root.$id);
      }

      // create empty watchers array for this scope
      if (!debug.watchers[ret.$id]) {
        debug.watchers[ret.$id] = [];
      }

      debug.scopes[ret.$id] = ret;
      debug.scopes[this.$id] = this;

      return ret;
    };


    // patch $digest
    // -------------
    var _digest = $delegate.__proto__.$digest;
    $delegate.__proto__.$digest = function (fn) {
      var ret = _digest.apply(this, arguments);
      emit.modelChange(this.$id);
      return ret;
    };


    // patch $apply
    // ------------
    var _apply = $delegate.__proto__.$apply;
    $delegate.__proto__.$apply = function (fn) {
      var start = performance.now();
      var ret = _apply.apply(this, arguments);
      var end = performance.now();

      // If the debugging option is enabled, log to console
      // --------------------------------------------------
      if (debug.log) {
        console.log(applyFnToLogString(fn) + '\t\t' + (end - start).toPrecision(4) + 'ms');
      }

      return ret;
    };


    return $delegate;
  });
});
