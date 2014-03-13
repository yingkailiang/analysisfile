'use strict';

/* global angular */
/* global Prefs */

angular.module('esse3AutoLoginApp')
    .controller('OptionsCtrl', ['$scope', '$rootScope',
        function ($scope, $rootScope) {
            $rootScope.title = 'Esse3 Auto Login // Opzioni';

            var prefs = new Prefs();

            $scope.saving = 0;

            $scope.portal = '';
            $scope.credentials = {
                username: '',
                password: ''
            };
            $scope.studentId = '';

            $scope.initPortal = function() {
                prefs.getPortal(function(_portal) {
                    $scope.portal = _portal;
                    $scope.$apply();
                    $scope.$watch('portal', function(newValue) {
                        console.log('portal has changed');
                        $scope.saving++;
                        prefs.setPortal(newValue, function() {
                            $scope.saving--;
                            $scope.$apply();
                        });
                    });
                });
            };
            $scope.initCredentials = function() {
                prefs.getCredentials(function(_credentials) {
                    $scope.credentials = _credentials;
                    $scope.$apply();
                    $scope.$watch('credentials.username', function() {
                        console.log('credentials has changed');
                        $scope.saving++;
                        prefs.setCredentials($scope.credentials, function() {
                            $scope.saving--;
                            $scope.$apply();
                        });
                    });
                    $scope.$watch('credentials.password', function() {
                        console.log('credentials has changed');
                        $scope.saving++;
                        prefs.setCredentials($scope.credentials, function() {
                            $scope.saving--;
                            $scope.$apply();
                        });
                    });
                });
            };
            $scope.initStudentId = function() {
                prefs.getStudentId(function(_studentId) {
                    $scope.studentId = _studentId;
                    $scope.$apply();
                    $scope.$watch('studentId', function(newValue) {
                        console.log('studentId has changed');
                        $scope.saving++;
                        prefs.setStudentId(newValue, function() {
                            $scope.saving--;
                            $scope.$apply();
                        });
                    });
                });
            };

            $scope.initPortal();
            $scope.initCredentials();
            $scope.initStudentId();
        }
    ]
);
