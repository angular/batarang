// TODO: this depends on global state and stuff

module.exports = function () {
  if (popover) {
    return;
  }
  var angular = window.angular;
  popover = angular.element(
    '<div style="position: fixed; left: 50px; top: 50px; z-index: 9999; background-color: #f1f1f1; box-shadow: 0 15px 10px -10px rgba(0, 0, 0, 0.5), 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;">' +
      '<div style="position: relative" style="min-width: 300px; min-height: 100px;">' +
        '<div style="min-width: 100px; min-height: 50px; padding: 5px;"><pre>{ Please select a scope }</pre></div>' +
        '<button style="position: absolute; top: -15px; left: -15px; cursor: move;">⇱</button>' +
        '<button style="position: absolute; top: -15px; left: 10px;">+</button>' +
        '<button style="position: absolute; top: -15px; right: -15px;">x</button>' +
        '<style>' +
          '.ng-scope.bat-selected { border: 1px solid red; } ' +
          '.bat-indent { margin-left: 20px; }' +
        '</style>' +
      '</div>' +
    '</div>');
  angular.element(window.document.body).append(popover);
  var popoverContent = angular.element(angular.element(popover.children('div')[0]).children()[0]);
  var dragElt = angular.element(angular.element(popover.children('div')[0]).children()[1]);
  var selectElt = angular.element(angular.element(popover.children('div')[0]).children()[2]);
  var closeElt = angular.element(angular.element(popover.children('div')[0]).children()[3]);

  var currentScope = null,
    currentElt = null;

  function onMove (ev) {
    var x = ev.clientX,
      y = ev.clientY;

    if (x > window.outerWidth - 100) {
      x = window.outerWidth - 100;
    } else if (x < 0) {
      x = 0;
    }
    if (y > window.outerHeight - 100) {
      y = window.outerHeight - 100;
    } else if (y < 0) {
      y = 0;
    }

    x += 5;
    y += 5;

    popover.css('left', x + 'px');
    popover.css('top', y + 'px');
  }

  closeElt.bind('click', function () {
    popover.remove();
    popover = null;
  });

  selectElt.bind('click', bindSelectScope);

  var selecting = false;
  function bindSelectScope () {
    if (selecting) {
      return;
    }
    setTimeout(function () {
      selecting = true;
      selectElt.attr('disabled', true);
      angular.element(document.body).css('cursor', 'crosshair');
      angular.element(document.getElementsByClassName('ng-scope'))
        .bind('click', onSelectScope)
        .bind('mouseover', onHoverScope);
    }, 30);
  }

  var hoverScopeElt = null;

  function markHoverElt () {
    if (hoverScopeElt) {
      hoverScopeElt.addClass('bat-selected');
    }
  }
  function unmarkHoverElt () {
    if (hoverScopeElt) {
      hoverScopeElt.removeClass('bat-selected');
    }
  }

  function onSelectScope (ev) {
    render(this);
    angular.element(document.getElementsByClassName('ng-scope'))
      .unbind('click', onSelectScope)
      .unbind('mouseover', onHoverScope);
    unmarkHoverElt();
    selecting = false;
    selectElt.attr('disabled', false);
    angular.element(document.body).css('cursor', '');
    hovering = false;
  }

  var hovering = false;
  function onHoverScope (ev) {
    if (hovering) {
      return;
    }
    hovering = true;
    var that = this;
    setTimeout(function () {
      unmarkHoverElt();
      hoverScopeElt = angular.element(that);
      markHoverElt();
      hovering = false;
      render(that);
    }, 100);
  }

  function onUnhoverScope (ev) {
    angular.element(this).css('border', '');
  }

  dragElt.bind('mousedown', function (ev) {
    ev.preventDefault();
    rendering = true;
    angular.element(document).bind('mousemove', onMove);
  });
  angular.element(document).bind('mouseup', function () {
    angular.element(document).unbind('mousemove', onMove);
    setTimeout(function () {
      rendering = false;
    }, 120);
  });

  function renderTree (data) {
    var tree = angular.element('<div class="bat-indent"></div>');
    angular.forEach(data, function (val, key) {
      var toAppend;
      if (val === undefined) {
        toAppend = '<i>undefined</i>';
      } else if (val === null) {
        toAppend = '<i>null</i>';
      } else if (val instanceof Array) {
        toAppend = '[ ... ]';
      } else if (val instanceof Object) {
        toAppend = '{ ... }';
      } else {
        toAppend = val.toString();
      }
      if (data instanceof Array) {
        toAppend = '<div>' +
          toAppend +
          ((key === (data.length - 1))?'':',') +
          '</div>';
      } else {
        toAppend = '<div>' +
          key +
          ': ' +
          toAppend +
          (key!==0?'':',') +
          '</div>';
      }
      toAppend = angular.element(toAppend);
      if (val instanceof Array || val instanceof Object) {
        function recur () {
          toAppend.unbind('click', recur);
          toAppend.html('');
          toAppend
            .append(angular.element('<span>' +
              key + ': ' +
              ((val instanceof Array)?'[':'{') +
              '<span>').bind('click', collapse))
            .append(renderTree(val))
            .append('<span>' + ((val instanceof Array)?']':'}') + '<span>');
        }
        function collapse () {
          toAppend.html('');
          toAppend.append(angular.element('<div>' +
            key +
            ': ' +
            ((val instanceof Array)?'[ ... ]':'{ ... }') +
            '</div>').bind('click', recur));
        }
        toAppend.bind('click', recur);
      }
      tree.append(toAppend);
    });

    return tree;
  }

  var isEmpty = function (object) {
    var prop;
    for (prop in object) {
      if (object.hasOwnProperty(prop)) {
        return false;
      }
    }
    return true;
  };

  var objLength = function (object) {
    var prop, len = 0;
    for (prop in object) {
      if (object.hasOwnProperty(prop)) {
        len += 1;
      }
    }
    return len;
  };

  var rendering = false;
  var render = function (elt) {
    if (rendering) {
      return;
    }
    rendering = true;
    setTimeout(function () {
      var scope = angular.element(elt).scope();
      rendering = false;
      if (scope === currentScope) {
        return;
      }
      currentScope = scope;
      currentElt = elt;

      var models = getScopeLocals(scope);
      popoverContent.children().remove();
      if (isEmpty(models)) {
        popoverContent.append(angular.element('<i>This scope has no models</i>'));
      } else {
        popoverContent.append(renderTree(models));
      }

    }, 100);
  };

};
