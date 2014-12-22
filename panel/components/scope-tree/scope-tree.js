angular.module('batarang.scope-tree', []).

directive('batScopeTree', ['$compile', batScopeTreeDirective]);

function batScopeTreeDirective($compile) {
  return {
    restrict: 'E',
    terminal: true,
    scope: {
      batModel: '='
    },
    link: batScopeTreeLink
  };

  function batScopeTreeLink(scope, element, attrs) {
    // scope.$id –> DOM node
    var map = {};
    var selectedElt = angular.element();

    // init
    var scopes = scope.batModel;
    if (scopes) {
      Object.keys(scopes).forEach(function (scopeId) {
        var parentId = scopes[scopeId].parent;
        renderScopeElement(scopeId, parentId);
        renderScopeDescriptorElement(scopeId, scopes[scopeId].descriptor);
      });
    }

    scope.$on('scope:new', function (ev, data) {
      renderScopeElement(data.child, data.parent);
    });

    // when a scope is linked, we can apply the descriptor info
    scope.$on('scope:link', function (ev, data) {
      renderScopeDescriptorElement(data.id, data.descriptor);
    });

    function renderScopeElement (id, parentId) {
      if (map[id]) {
        return;
      }
      var elt = map[id] = newBranchElement(id);
      var parentElt = map[parentId] || element;

      elt.children().eq(1).on('click', function () {
        scope.$apply(function () {
          scope.$emit('inspected-scope:change', {
            id: id
          });
          selectedElt.children().eq(0).removeClass('selected');
          selectedElt.children().eq(1).removeClass('selected');

          selectedElt = elt;

          selectedElt.children().eq(0).addClass('selected');
          selectedElt.children().eq(1).addClass('selected');
        });
      });

      parentElt.append(elt);
    }

    function renderScopeDescriptorElement (id, descriptor) {
      var elt = map[id];
      if (!elt) {
        return;
      }
      elt.children().eq(1).children().eq(1).html(descriptor);
    }

    // TODO: also destroy elements corresponding to descendant scopes
    scope.$on('scope:destroy', function (ev, data) {
      var id = data.id;
      var elt = map[id];
      if (elt) {
        elt.remove();
      }
      delete map[id];
    });

  }
}


// TODO: tabindex
function newBranchElement(descriptor) {
  return angular.element([
    '<ol class="children expanded">',
      '<div class="selection"></div>',
      '<span>',
        '<span class="webkit-html-tag">&lt;</span>',
        '<span class="webkit-html-attribute">Scope #', descriptor, '</span>',
        '<span class="webkit-html-tag">&gt;</span>',
      '</span>',
    '</ol>'].join(''));
}
