// model tree
panelApp.directive('d3', function($compile) {
  return {
    restrict: 'E',
    terminal: true,
    scope: {
      val: '=val'
    },
    link: function (scope, element, attrs) {
      var dom = document.createElement('div');
      element.append(dom);

      var classes = [{"name":"$provide","size":0,"imports":[]},{"name":"$rootScope","size":0,"imports":["$injector","$exceptionHandler","$parse"]},{"name":"$injector","size":0,"imports":[]},{"name":"$exceptionHandler","size":0,"imports":["$log"]},{"name":"$log","size":0,"imports":["$window"]},{"name":"$window","size":0,"imports":[]},{"name":"$parse","size":0,"imports":["$filter","$sniffer"]},{"name":"$filter","size":0,"imports":["$injector"]},{"name":"$sniffer","size":0,"imports":["$window"]},{"name":"$rootElement","size":0,"imports":[]},{"name":"$compile","size":0,"imports":["$injector","$interpolate","$exceptionHandler","$http","$templateCache","$parse","$controller","$rootScope"]},{"name":"$interpolate","size":0,"imports":["$parse"]},{"name":"$http","size":0,"imports":["$httpBackend","$browser","$cacheFactory","$rootScope","$q","$injector"]},{"name":"$httpBackend","size":0,"imports":["$browser","$window","$document"]},{"name":"$browser","size":0,"imports":["$window","$log","$sniffer","$document"]},{"name":"$document","size":0,"imports":["$window"]},{"name":"$cacheFactory","size":0,"imports":[]},{"name":"$q","size":0,"imports":["$rootScope","$exceptionHandler"]},{"name":"$templateCache","size":0,"imports":["$cacheFactory"]},{"name":"$controller","size":0,"imports":["$injector","$window"]},{"name":"scriptDirective","size":0,"imports":["$injector","$exceptionHandler","$templateCache"]},{"name":"styleDirective","size":0,"imports":["$injector","$exceptionHandler"]},{"name":"ngControllerDirective","size":0,"imports":["$injector","$exceptionHandler"]},{"name":"aDirective","size":0,"imports":["$injector","$exceptionHandler"]},{"name":"ngClickDirective","size":0,"imports":["$injector","$exceptionHandler","$parse"]},{"name":"ngRepeatDirective","size":0,"imports":["$injector","$exceptionHandler"]},{"name":"inputDirective","size":0,"imports":["$injector","$exceptionHandler","$browser","$sniffer"]},{"name":"ngModelDirective","size":0,"imports":["$injector","$exceptionHandler"]},{"name":"formDirective","size":0,"imports":["$injector","$exceptionHandler"]},{"name":"ngSubmitDirective","size":0,"imports":["$injector","$exceptionHandler"]},{"name":"thing","size":0,"imports":[]},{"name":"otherThing","size":0,"imports":["thing","$http"]}];

      // Based on code from: http://mbostock.github.com/d3/talk/20111116/bundle.html

      var packages = {

        // Lazily construct the package hierarchy from class names.
        root: function(classes) {
          var map = {};

          function find(name, data) {
            var node = map[name], i;
            if (!node) {
              node = map[name] = data || {name: name, children: []};
              if (name.length) {
                node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
                node.parent.children.push(node);
                node.key = name.substring(i + 1);
              }
            }
            return node;
          }

          classes.forEach(function(d) {
            find(d.name, d);
          });

          return map[""];
        },

        // Return a list of imports for the given array of nodes.
        imports: function(nodes) {
          var map = {},
              imports = [];

          // Compute a map from name to node.
          nodes.forEach(function(d) {
            map[d.name] = d;
          });

          // For each import, construct a link from the source to target node.
          nodes.forEach(function(d) {
            if (d.imports) d.imports.forEach(function(i) {
              imports.push({source: map[d.name], target: map[i]});
            });
          });

          return imports;
        }

      };

      var w = 600,
          h = 600,
          rx = w / 2,
          ry = h / 2,
          m0,
          rotate = 0;

      var splines = [];

      var sanitize = function (key) {
        return key.replace('$', 'dollar')
      }

      var cluster = d3.layout.cluster()
          .size([360, ry - 120])
          .sort(function(a, b) { return d3.ascending(a.key, b.key); });

      var bundle = d3.layout.bundle();

      var line = d3.svg.line.radial()
          .interpolate("bundle")
          .tension(.85)
          .radius(function(d) { return d.y; })
          .angle(function(d) { return d.x / 180 * Math.PI; });

      // Chrome 15 bug: <http://code.google.com/p/chromium/issues/detail?id=98951>
      var div = d3.select(dom);
      /*
          .style("top", "-80px")
          .style("left", "-160px")
          .style("width", w + "px")
          .style("height", w + "px")
          .style("position", "absolute");
      */

      var svg = div.append("svg:svg")
          .attr("width", w)
          .attr("height", w)
        .append("svg:g")
          .attr("transform", "translate(" + rx + "," + ry + ")");

      svg.append("svg:path")
          .attr("class", "arc")
          .attr("d", d3.svg.arc().outerRadius(ry - 120).innerRadius(0).startAngle(0).endAngle(2 * Math.PI))
          .on("mousedown", mousedown);

      //scope.$watch('val', function () {
      var nodes = cluster.nodes(packages.root(classes)),
          links = packages.imports(nodes),
          splines = bundle(links);

      var path = svg.selectAll("path.link")
          .data(links)
        .enter().append("svg:path")
          .attr("class", function(d) { return "link source-" + sanitize(d.source.key) + " target-" + sanitize(d.target.key); })
          .attr("d", function(d, i) { return line(splines[i]); });

      svg.selectAll("g.node")
          .data(nodes.filter(function(n) { return !n.children; }))
        .enter().append("svg:g")
          .attr("class", "node")
          .attr("id", function(d) { return "node-" + sanitize(d.key); })
          .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
        .append("svg:text")
          .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
          .attr("dy", ".31em")
          .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
          .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
          .text(function(d) { return d.key; })
          .on("mouseover", mouseover)
          .on("mouseout", mouseout);

      d3.select("input[type=range]").on("change", function() {
        line.tension(this.value / 100);
        path.attr("d", function(d, i) { return line(splines[i]); });
      });
      //});

      //TODO: decide where to attach these events
      /*
      d3.select(window)
          .on("mousemove", mousemove)
          .on("mouseup", mouseup);
      */

      function mouse(e) {
        return [e.pageX - rx, e.pageY - ry];
      }

      function mousedown() {
        m0 = mouse(d3.event);
        d3.event.preventDefault();
      }

      function mousemove() {
        if (m0) {
          var m1 = mouse(d3.event),
              dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;
          div.style("-webkit-transform", "translate3d(0," + (ry - rx) + "px,0)rotate3d(0,0,0," + dm + "deg)translate3d(0," + (rx - ry) + "px,0)");
        }
      }

      function mouseup() {
        if (m0) {
          var m1 = mouse(d3.event),
              dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;

          rotate += dm;
          if (rotate > 360) rotate -= 360;
          else if (rotate < 0) rotate += 360;
          m0 = null;

          div.style("-webkit-transform", "rotate3d(0,0,0,0deg)");

          svg
              .attr("transform", "translate(" + rx + "," + ry + ")rotate(" + rotate + ")")
            .selectAll("g.node text")
              .attr("dx", function(d) { return (d.x + rotate) % 360 < 180 ? 8 : -8; })
              .attr("text-anchor", function(d) { return (d.x + rotate) % 360 < 180 ? "start" : "end"; })
              .attr("transform", function(d) { return (d.x + rotate) % 360 < 180 ? null : "rotate(180)"; });
        }
      }

      function mouseover(d) {
        svg.selectAll("path.link.target-" + sanitize(d.key))
            .classed("target", true)
            .each(updateNodes("source", true));

        svg.selectAll("path.link.source-" + sanitize(d.key))
            .classed("source", true)
            .each(updateNodes("target", true));
      }

      function mouseout(d) {
        svg.selectAll("path.link.source-" + sanitize(d.key))
            .classed("source", false)
            .each(updateNodes("target", false));

        svg.selectAll("path.link.target-" + sanitize(d.key))
            .classed("target", false)
            .each(updateNodes("source", false));
      }

      function updateNodes(name, value) {
        return function(d) {
          if (value) this.parentNode.appendChild(this);
          svg.select("#node-" + sanitize(d[name].key)).classed(name, value);
        };
      }

      function cross(a, b) {
        return a[0] * b[1] - a[1] * b[0];
      }

      function dot(a, b) {
        return a[0] * b[0] + a[1] * b[1];
      }

      // compile and go!
      $compile(element.contents())(scope.$new());
    }
  };
});
