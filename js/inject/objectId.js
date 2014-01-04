//Several tool methods extracted from debug.js in order to write unit tests on them
function ngTool() {

  // Gets attribute from the object which looks like object identifier - id, name, email, etc.
  function getIdAttribute (obj) {
    if (window.angular.isString(obj)) {
      return undefined;
    }
    var possibleIdAttrs = ['__id', 'Email', 'Mail', 'FullName', 'full_name', 'Name', 'Title', 'Subject', 'Id', '_id', '$id'];
    for (var i = 0; i < possibleIdAttrs.length; i++) {
      var attrName = possibleIdAttrs[i];
      var firstExistent = [attrName, attrName.toLowerCase()].filter(function(variation) {return !!obj[variation];})[0];
      if (firstExistent) return firstExistent;
    }
    return undefined;
  }

  function withoutAngularInternal (keys) {
    var angularInternal = ["$$hashKey"];
    return keys.filter(function(key) {
      return angularInternal.indexOf(key) == -1;
    });
  }

  var __ngTool = {};

  // Renders provided object (or array) to the string which briefily describes the object:
  // - for array renders only first element
  // - for object renders only attribute which looks like object identifier - id, name, email, etc.
  // - for primitive values render themselves
  // It could be used in order to show some brief information about object without printing whole object - in lists, trees, etc.,
  // so it is easier to read.
  var objectId = __ngTool.objectId = function (obj) {
    var rest = '';
    if (window.angular.isArray(obj)) {
      var firstItem = obj.length > 0 ? objectId(obj[0]) : '';
      if (obj.length > 1) rest = ", ...";
      return "[ " + firstItem + rest + " ]";
    }
    else if (window.angular.isObject(obj)) {
      var keys = withoutAngularInternal(Object.keys(obj));
      var idAttr = getIdAttribute(obj) || keys[0];
      var idExpr = idAttr ? (idAttr + ": " + objectId(obj[idAttr])) : "";
      if (keys.length > 1) rest = ", ...";
      return "{ " + idExpr + rest + " }";
    }
    else {
      return JSON.stringify(obj);
    }
  };

  return __ngTool;

}