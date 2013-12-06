// Similar to browserify, but inlines the scripts instead.
// This is a really dumb naive approach that only supports `module.exports =`

var fs = require('fs');

var debug = fs.readFileSync(__dirname + '/../content-scripts/inject.js', 'utf8');

var r = new RegExp("require\\('(.+?)'\\)", 'g');

var out = debug.replace(r, function (match, file) {
  return ex(file);
});

fs.writeFileSync(__dirname + '/../content-scripts/inject.build.js', out);

// takes the contents of a file, wraps it in a closure
// and returns the result
function ex (file) {
  contents = fs.readFileSync(__dirname + '/../content-scripts/' + file, 'utf8');
  contents = contents.replace('module.exports = ', 'return ');
  contents =  '(function () {\n' +
                '// exported from ' + file + '\n' +
                contents + '\n' +
              '}())';

  return contents;
}
