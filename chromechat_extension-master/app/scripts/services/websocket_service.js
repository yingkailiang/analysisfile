'use strict';

angular.module('chromechatApp.Services')
  .factory('$websocketService', [function() {
    var topicName = 'inboundMessage';

    return {
      start: function(scope, websocketUrl) {
        var socket = new WebSocket(websocketUrl);
        socket.onmessage = function(message){
          scope.$broadcast(topicName, angular.fromJson(message.data));
        };
      }
    };
  }]);
