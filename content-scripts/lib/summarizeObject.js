
module.exports = function summarizeObject (obj) {
  var summary = {}, keys;
  if (obj instanceof Array) {
    keys = obj.map(function (e, i) { return i; });
  } else if (typeof obj === 'object') {
    keys = Object.keys(obj);
  } else {
    return '=' + obj.toString().substr(0, 10);
  }

  var id;

  if (keys.some(function (key) {
    var lowKey = key.toLowerCase();
    if (lowKey.indexOf('name') !== -1 ||
        lowKey.indexOf('id') !== -1) {
      return id = key;
    }
  })) {
    return '.' + id + '="' + obj[id].toString() + '"';
  }

  if (keys.length > 5) {
    keys = keys.slice(0, 5);
  }

  keys.forEach(function (key) {
    var val = obj[key];
    if (val instanceof Array) {
      summary[key] = '[ … ]';
    } else if (typeof val === 'object') {
      summary[key] = '{ … }';
    } else if (typeof val === 'function') {
      summary[key] = 'fn';
    } else {
      summary[key] = obj[key].toString();
      if (summary[key].length > 10) {
        summary[key] = summary[key].substr(0, 10) + '…';
      }
    }
  });
  return '=' + JSON.stringify(summary);
};
