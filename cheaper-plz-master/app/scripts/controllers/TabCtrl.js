/*global angular:false, chrome:false*/
'use strict';

angular.module('cheaperApp.tab', [
    'cheaperApp.chromeApp',
    'cheaperApp.settings',
    'cheaperApp.sparkline'
  ]).
  controller('TabCtrl',
    function ($scope, chromeApp) {

      // item and history state
      $scope.items = chromeApp.getItems();
      $scope.removeItem = chromeApp.removeItem;

      $scope.history = chromeApp.getItemHistory();

      
      // refresh status
      $scope.isRefreshing = chromeApp.isRefreshing;
      $scope.refreshStatus = ''; // message representing result of a refresh
      $scope.refresh = function () {
        $scope.refreshStatus = '';
        chromeApp.refresh(function (refreshStatus) {
          $scope.refreshStatus = refreshStatus ?
            'Items were updated!' : 'Nothing new!';
        });
      };


      $scope.openHomepage = chromeApp.openHomepage;


      // on load, clear the update alerts
      chromeApp.clearUpdateAlert();

    });
