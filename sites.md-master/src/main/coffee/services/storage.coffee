'use strict';

class Storage
  constructor:(@$scope, @$q)->

  get: (name)->
    d = @$q.defer()
    chrome.storage.local.get name, (res)=>
      @$scope.$apply ()-> d.resolve(res[name])
    d.promise
  set: (name, value)->
    d = @$q.defer()
    val = {}
    val[name] = value
    chrome.storage.local.set val, (res)=>
      @$scope.$apply ()-> d.resolve res
    d.promise

return if !angular

angular.module('sites.md')
  .service 'storage', ['$rootScope','$q', Storage]