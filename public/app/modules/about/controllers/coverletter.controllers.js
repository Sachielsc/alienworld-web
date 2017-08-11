'use strict';
angular.module('about').controller('coverletterController', ['$log', '$scope', function($log, $scope){
	$log.debug('"coverletterController" complete ...');
    
    $scope.hideCoverLetter = true;

    $scope.clearvalue = function () {
        $scope.coverletterpassword = "";
    }

    $scope.passvalue = function () {
        if ($scope.coverletterpassword=="scsgdtcy3") {
        	$scope.hideCoverLetter = false;
        } else {
        	$scope.hideCoverLetter = true;
        }
    }
}]
)