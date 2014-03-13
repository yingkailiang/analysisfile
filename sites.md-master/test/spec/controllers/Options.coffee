'use strict'

describe 'Controller: OptionsCtrl', () ->

  # load the controller's module
  beforeEach module 'sitesAsMarkdownApp'

  OptionsCtrl = {}
  scope = {}

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    OptionsCtrl = $controller 'OptionsCtrl', {
      $scope: scope
    }

  it 'should attach a list of awesomeThings to the scope', () ->
    expect(scope.awesomeThings.length).toBe 3
