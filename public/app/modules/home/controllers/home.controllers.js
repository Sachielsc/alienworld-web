'use strict';
angular.module('home').controller('homeController', ['$log', '$scope', function($log, $scope){
	$scope.currentdate =  new Date();
	$scope.currentdate.year = $scope.currentdate.getFullYear();
	$scope.currentdate.month = $scope.currentdate.getMonth() + 1;
	$scope.currentdate.day = $scope.currentdate.getDate();
	$scope.currentdate.date = $scope.currentdate.day + "/" + $scope.currentdate.month + "/" + $scope.currentdate.year;
}]
)