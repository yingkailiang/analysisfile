angular.module('bookmarkApp')
.directive('timelineJs',  function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            scope.$watch('timelineData', function (value) {
                $( "#my-timeline" ).empty();
                postpone = $timeout(function() {
                    createStoryJS({
                        type:       'timeline',
                        width:      '100%',
                        height:     '600',
                        source:     scope.timelineData,
                        embed_id:   'my-timeline',
                        css:        'lib/timelinejs/css/timeline.css',
                        js:         'lib/timelinejs/js/timeline.js'
                    });
                }, 0);
                console.log("Running timelineJS");
                console.log(scope.timelineData.timeline.date);

            }, true);
        }
    }
});