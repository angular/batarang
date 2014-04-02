// Similar to browserify, but inlines the scripts instead.
// This is a really dumb naive approach that only supports `module.exports =`

var fs = require('fs');
var r = new RegExp("( *)(.*?)require\\('(.+?)'\\)", 'g');

module.exports = function () {
  var debug = fs.readFileSync(__dirname + '/../content-scripts/inject.js', 'utf8');

  var out = debug.replace(r, function (match, whitespace, before, file) {
    return whitespace + '// exported from ' + file + '\n' +
           whitespace + before + ex(whitespace, file);
  });

  fs.writeFileSync(__dirname + '/../content-scripts/inject.build.js', out);
};

// takes the contents of a file, wraps it in a closure
// and returns the result
function ex (whitespace, file) {
  var contents = fs.readFileSync(__dirname + '/../content-scripts/' + file, 'utf8');
  contents = contents.replace('module.exports = ', 'return ');
  contents = ['(function () {'].
              concat(contents.split('\n').
                map(function (line) {
                  return '  ' + line;
                }).
              concat(['}())']).
              map(function (line) {
                return whitespace + line;
              })).join('\n');

  return contents;
}
