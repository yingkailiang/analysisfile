'use strict';

angular.module('chromechatApp',
  [
    'chromechatApp.Controllers',
    'chromechatApp.Directives',
    'chromechatApp.Services'
  ])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'views/chat.html',
      controller: 'ChatController'
    });
  }])
  .value('websocketUrl', 'ws://localhost:3030/websocket');
