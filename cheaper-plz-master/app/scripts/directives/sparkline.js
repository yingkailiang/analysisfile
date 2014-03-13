/*global angular:false, d3:false*/
'use strict';

angular.module('cheaperApp.sparkline', []).
  directive('sparkline', function () {
    return {
      restrict: 'E',
      templateUrl: 'directives/sparkline.html',
      scope: {
        data: '='
      },
      link: function postLink (scope, element) {

        // create an SVG element inside the #graph div that fills 100% of the div
        var graph = d3.select(element[0].getElementsByClassName('sparkContainer')[0])
          .append('svg:svg')
          .attr('width', '100%')
          .attr('height', '100%');

        var path = graph.append('svg:path');

        scope.$watch('data', function (data) {

          if (!data || data.length === 0) {
            data = [ 0 ];
          }

          var min = (Math.min.apply(Math, data) - 1);
          var max = (Math.max.apply(Math, data) + 1);
            
          // X scale will fit values from 0-10 within pixels 0-100
          var x = d3.scale.linear().domain([0, 10]).range([0, 200]);
          // Y scale will fit values from 0-10 within pixels 0-100
          var y = d3.scale.linear().domain([ min, max ]).range([60, 0]);

          // create a line object that represents the SVN line we're creating
          var line = d3.svg.line()
            // assign the X function to plot our line as we wish
            .x(function(d, i) {
              // verbose logging to show what's actually being done
              // return the X coordinate where we want to plot this datapoint
              return x(i);
            })
            .y(function(d) {
              // verbose logging to show what's actually being done
              // return the Y coordinate where we want to plot this datapoint
              return y(d);
            });

            // display the line by appending an svg:path element with the data line we created above
            path.attr('d', line(data));
        }, true);
      }
    };
  });
