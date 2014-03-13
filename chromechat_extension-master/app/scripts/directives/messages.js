'use strict';

angular.module('chromechatApp.Directives')
  .directive('messages', [function(){
    return {
      restrict: 'E',
      templateUrl: 'templates/messages.html',
      scope: {
        messages: '='
      },
      link: function($scope, element, attrs) {
      }
    };
  }]);
