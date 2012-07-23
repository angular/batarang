// D3 visualization
// TODO: D3 as a service
panelApp.directive('d3', function($compile) {
  return {
    restrict: 'E',
    terminal: true,
    scope: {
      val: '=val'
    },
    link: function (scope, element, attrs) {
      // Based on code from: http://mbostock.github.com/d3/talk/20111116/bundle.html

      // Initialize Element
      // ------------------
      var div = d3.select(element[0]);

      // Constants
      // ---------
      var w = 600,
          h = 600,
          rx = w / 2,
          ry = h / 2,
          m0,
          rotate = 0;

      // Helpers
      // -------

      // generate element ids that do not have '$'
      var sanitize = function (key) {
        return key.replace('$', 'dollar')
      }

      var packages = {
        // Lazily construct the package hierarchy from class names.
        root: function(classes) {
          var map = {};

          // add "classes" with no dependencies
          var exist = {},
            toAdd = [];
          classes.forEach(function (cl) {
            exist[cl.name] = true;
          });
          classes.forEach(function (cl) {
            cl.imports.forEach(function (im) {
              if (!exist[im]) {
                toAdd.push(im);
                exist[im] = true;
              }
            });
          });
          toAdd.forEach(function (a) {
            classes.push({
              name: a,
              size: 0,
              imports: []
            });
          });

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

      // Instantiate and Style D3 Objects
      // --------------------------------

      var cluster = d3.layout.cluster()
          .size([360, ry - 120])
          .sort(function(a, b) { return d3.ascending(a.key, b.key); });

      var bundle = d3.layout.bundle();

      var line = d3.svg.line.radial()
          .interpolate("bundle")
          .tension(.85)
          .radius(function(d) { return d.y; })
          .angle(function(d) { return d.x / 180 * Math.PI; });

      var svg = div.append("svg:svg")
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", [0, 0, w, h].join(' '))
          .attr("height", h)
        .append("svg:g")
          .attr("transform", "translate(" + rx + "," + ry + ")");

      svg.append("svg:path")
          .attr("class", "arc")
          .attr("d", d3.svg.arc().outerRadius(ry - 120).innerRadius(0).startAngle(0).endAngle(2 * Math.PI))
          .on("mousedown", mousedown);

      // Render the data whenever "val" changes
      // --------------------------------------
      scope.$watch('val', function (newVal, oldVal) {
        var classes = newVal;

        if (oldVal || !classes || classes.length === 0) {
          return;
        }

        //div[0].innerHTML = '';

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
      });

      /*
      d3.select("input[type=range]").on("change", function() {
        line.tension(this.value / 100);
        path.attr("d", function(d, i) { return line(splines[i]); });
      });
      */

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
