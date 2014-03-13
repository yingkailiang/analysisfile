'use strict'

angular.module('sites.md')
  .controller 'OptionsCtrl',
    ['$scope','storage',
      class OptionsCtrl

        DEFAULT_SETTING = type : 'url', auto: 'on', expressionType : "title"

        constructor:(@$scope, @$storage)->
          @settings = @$storage.get("settings").then (settings)=> @settings = settings || []

          @initSetting()
        initSetting :()=>
          @setting = null
          @$scope.setting = angular.copy @setting || DEFAULT_SETTING

        selectSetting:()->
          @$scope.setting = angular.copy @setting || DEFAULT_SETTING

        add: (setting)->
          @settings.push setting
          @$storage.set "settings", @settings
          @initSetting()
        modify : (setting)->
          @setting.name = setting.name
          @setting.type = setting.type
          @setting.expressionType = setting.expressionType
          @setting.auto = setting.auto
          @setting.expressionText = setting.expressionText
          @$storage.set "settings", @settings

        delKey : ($event)->
          return if $event.keyCode isnt 8
          @del()

        del : ()->
          return if !@setting

          @settings.splice(@settings.indexOf(@setting), 1)
          @$storage.set "settings", @settings
          @initSetting()
        reset : ()->
          @$scope.setting = angular.copy @setting || DEFAULT_SETTING

    ]

