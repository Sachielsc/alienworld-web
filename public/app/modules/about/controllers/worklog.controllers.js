'use strict';
angular.module('about').controller('worklogController', ['$log', '$scope', function ($log, $scope) {

        var myPassWord = "scsgdtcy3";

        $scope.hideWorkLog = true;

        $scope.clearValueWorkLog = function () {
            $scope.coverletterpassword = "";
        };

        $scope.passValueWorkLog = function () {
            if ($scope.worklogpassword == myPassWord) {
                $scope.hideWorkLog = false;
            } else {
                $scope.hideWorkLog = true;
            }
        };
    }]
)