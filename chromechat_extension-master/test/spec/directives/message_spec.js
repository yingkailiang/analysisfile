/*global describe, it */
'use strict';

describe('Message', function () {
  var el, scope;

  beforeEach(function(){
    module('chromechatApp.Directives', 'templates');

    inject(function($compile, $rootScope) {
      var fakeMessage = {};
      el = angular.element("<message data-message='message'></message>");
      scope = $rootScope;
      scope.message = {
        username: 'nathan',
        text: 'hey guy'
      };
      $compile(el)(scope);
      scope.$digest();
    });
  });

  it('renders the username', function () {
    expect(angular.element('.username', el).text()).toEqual('nathan');
  });

  it('renders the content', function () {
    expect(angular.element('.text', el).text()).toEqual('hey guy');
  });
});
