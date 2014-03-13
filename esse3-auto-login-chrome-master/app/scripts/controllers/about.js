'use strict';

/* global angular */

angular.module('esse3AutoLoginApp')
  .controller('AboutCtrl', ['$scope', '$rootScope', '$http',
    function ($scope, $rootScope, $http) {
      $rootScope.title = 'Esse3 Auto Login // About';

      $http.get('history.json')
        .success(function(history) {
          $scope.history = history;
        });
    }
  ]
  );
