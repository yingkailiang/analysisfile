/*global angular:false, chrome:false*/
'use strict';

angular.module('cheaperApp.settings', [
    'cheaperApp.chromeApp'
  ]).
  controller('SettingsCtrl',
    function ($scope, chromeApp) {

      $scope.refreshInterval = chromeApp.getRefreshInterval();
      $scope.updateRefreshInterval = function () {
        var refreshInterval = parseInt($scope.refreshInterval, 10);
        if (refreshInterval > 100) {
          chromeApp.setRefreshInterval(refreshInterval);
        } else {
          $scope.refreshInterval = chromeApp.getRefreshInterval();
        }
      };

    });
