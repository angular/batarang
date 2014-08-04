
require('./bower_components/angular-loader/angular-loader.js');
require('angular-hint');

// afterThisGetsDefined(window, 'angular', function () {
//   afterThisGetsDefined(angular, 'module', function () {
//     require('angular-hint');
//   });
// });

// function afterThisGetsDefined(obj, prop, fn) {
//   Object.defineProperty(obj, prop, {
//     set: function (val) {
//       Object.defineProperty(obj, prop, {
//         configurable: true,
//         writable: true
//       });
//       obj[prop] = val;
//       fn();
//     },
//     configurable: true
//   });
// }
