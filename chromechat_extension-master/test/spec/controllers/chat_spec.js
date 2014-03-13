/*global describe, it */
'use strict';

describe('ChatController', function () {
  var el, scope, mockUsers, subject;

  beforeEach(function(){
    mockUsers = {};

    module('chromechatApp.Controllers');

    inject(function($rootScope, $controller) {
      scope = $rootScope;
      subject = $controller('ChatController', {
        $scope: scope
      });
    });
  });

  it('populates its users when the server sends them', function () {
    scope.$broadcast('inboundMessage', { users: mockUsers });
    expect(scope.users).toEqual(mockUsers);
  });
});
