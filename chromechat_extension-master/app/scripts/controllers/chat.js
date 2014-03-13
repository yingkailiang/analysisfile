'use strict';

angular.module('chromechatApp.Controllers', [])
  .controller('ChatController', ['$scope', '$websocketService', 'websocketUrl', function($scope, $websocketService, websocketUrl) {
    $websocketService.start($scope, websocketUrl);
    var isUserList = function(data){
      return !angular.isUndefined(data.users)
    };
    var isMessage = function(data){
      return angular.isDefined(data.username) && angular.isDefined(data.text);
    };
    $scope.messages = [{ username: 'knewter', text: 'hai' }];
    $scope.users = [{ username: 'knewter' }];
    $scope.$on('inboundMessage', function(evt, data){
      if(isMessage(data)){
        // Really not sure why I had to $apply :-\
        $scope.$apply(function(){
          $scope.messages.push(data);
        });
      }
      if(isUserList(data)){
        $scope.users = data.users;
      }
    });
  }]);
