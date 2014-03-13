'use strict';

angular.module('chromechatApp.Directives')
  .directive('userList', [function(){
    return {
      restrict: 'E',
      templateUrl: 'templates/user_list.html',
      scope: {
        users: '='
      },
      link: function($scope, element, attrs) {
      }
    };
  }]);
