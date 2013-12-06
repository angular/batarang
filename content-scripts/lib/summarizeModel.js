
// TODO: handle DOM nodes, fns, etc better.
var subModel = function (obj) {
  return obj instanceof Array ?
      { '~array-length': obj.length } :
    obj === null ?
      null :
    typeof obj === 'object' ?
      { '~object': true } :
      obj;
};

module.exports = function (id, path) {

  if (path === undefined || path === '') {
    path = [];
  } else if (typeof path === 'string') {
    path = path.split('.');
  }

  var dest = debug.scopes[id],
    segment;

  if (!dest) {
    return;
  }

  while (path.length > 0) {
    segment = path.shift();
    dest = dest[segment];
    if (!dest) {
      return;
    }
  }

  if (dest instanceof Array) {
    return dest.map(subModel);
  } else if (typeof dest === 'object') {
    return Object.
      keys(dest).
      filter(function (key) {
        return key[0] !== '$' || key[1] !== '$';
      }).
      reduce(function (obj, prop) {
        obj[prop] = subModel(dest[prop]);
        return obj;
      }, {});
  } else {
    return dest;
  }
};
