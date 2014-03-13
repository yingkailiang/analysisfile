'use strict';

angular.module('chromechatApp.Directives')
  .directive('messageBox', [function(){
    return {
      restrict: 'E',
      templateUrl: 'templates/message_box.html',
      scope: {},
      link: function($scope, element, attrs) {
        $scope.sendMessage = function(){
          $scope.$emit('message', { text: $scope.text });
          $scope.text = '';
        };
      }
    };
  }]);
