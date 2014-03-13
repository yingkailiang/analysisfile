'use strict';

/* global angular */

angular.module('esse3AutoLoginApp', [])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/settings', {
                templateUrl: 'views/options.html',
                controller: 'OptionsCtrl'
            })
            .when('/about', {
                templateUrl: 'views/about.html',
                controller: 'AboutCtrl'
            })
            .otherwise({
                redirectTo: '/settings'
            });
    }]);
