/*global angular:false, chrome:false*/
'use strict';

angular.module('cheaperApp.popup', [
    'cheaperApp.chromeApp'
  ]).
  controller('PopupCtrl',
    function ($scope, chromeApp) {

      $scope.items = chromeApp.getItems();


      $scope.scrapeCurrentPage = chromeApp.scrapeCurrentPage;
      $scope.refresh = chromeApp.refresh;


      $scope.openTab = chromeApp.openTab;


      $scope.getUpdated = chromeApp.getUpdated;
      $scope.clearUpdated = chromeApp.clearUpdated;
      chromeApp.clearUpdateAlert();

    });
