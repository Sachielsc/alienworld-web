'use strict';

var mainModule = angular.module('alienworld',['ui.router', 'ngAnimate', 'home', 'movies', 'games', 'community', 'about', 'report']);

mainModule.controller('MainController', ['$scope','$log', function($scope,$log){
	function init(){
		$scope.currentdate =  new Date();
		$scope.currentdate.year = $scope.currentdate.getFullYear();
		$scope.currentdate.month = $scope.currentdate.getMonth() + 1;
		$scope.currentdate.day = $scope.currentdate.getDate();
		$scope.currentdate.date = $scope.currentdate.day + "/" + $scope.currentdate.month + "/" + $scope.currentdate.year;
		$log.debug('date initialization complete...');
			}
	init();
	}
]);

mainModule.config(['$stateProvider', '$locationProvider', function($stateProvider, $locationProvider) {
	$locationProvider.html5Mode(true); //enable the html5Mode
	}
]);

mainModule.run(['$rootScope','$state','$log', function($rootScope,$state,$log){
	$log.debug('"mainModule.run" complete ...');
	}
]);