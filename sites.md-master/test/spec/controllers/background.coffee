'use strict'

describe 'Controller: BackgroundCtrl', () ->

  # load the controller's module
  beforeEach module 'sitesAsMarkdownApp'

  BackgroundCtrl = {}
  scope = {}

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    BackgroundCtrl = $controller 'BackgroundCtrl', {
      $scope: scope
    }

  it 'should attach a list of awesomeThings to the scope', () ->
    expect(scope.awesomeThings.length).toBe 3
