/*global describe, it */
'use strict';

describe('Messages', function () {
  var el, scope;

  beforeEach(function(){
    module('chromechatApp.Directives', 'templates');

    inject(function($compile, $rootScope) {
      var fakeMessage = {};
      el = angular.element("<messages data-messages='messages'></messages>");
      scope = $rootScope;
      scope.messages = [fakeMessage];
      $compile(el)(scope);
      scope.$digest();
    });
  });

  it('renders a message for each message in the scope\'s messages', function () {
    expect(angular.element('message', el).length).toEqual(1);
  });
});
