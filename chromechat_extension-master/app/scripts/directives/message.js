'use strict';

angular.module('chromechatApp.Directives')
  .directive('message', [function(){
    return {
      restrict: 'E',
      templateUrl: 'templates/message.html',
      scope: {
        message: '='
      },
      link: function($scope, element, attrs) {
      }
    };
  }]);
