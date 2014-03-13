/*global describe, it */
'use strict';

describe('MessageBox', function () {
  var el, scope;

  beforeEach(function(){
    module('chromechatApp.Directives', 'templates');

    inject(function($compile, $rootScope) {
      el = angular.element("<message-box></message-box>");
      scope = $rootScope;
      $compile(el)(scope);
      scope.$digest();
    });
  });

  it('emits a message onSubmit', function () {
    var sawEvent = jasmine.createSpy();
    scope.$on('message', function(evt, data){
      sawEvent(data);
    });
    angular.element(el).scope().text = 'hey guys';
    scope.$digest();

    angular.element(el).scope().sendMessage();
    expect(sawEvent).toHaveBeenCalledWith({ text: 'hey guys' });
  });

  it('clears the scope\'s text on submit', function () {
    angular.element(el).scope().text = 'hey guys';
    angular.element(el).scope().sendMessage();
    expect(angular.element(el).scope().text).toEqual('');
  });
});
