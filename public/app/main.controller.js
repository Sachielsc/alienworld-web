'use strict';

var mainModule = angular.module('alienworld',['ui.router', 'ngAnimate', 'home', 'movies', 'games', 'community', 'about']);

mainModule.controller('MainController', ['$scope','$log', function($scope,$log){
		function init(){
			$log.debug('initialization complete...');
			// put initialization code here
		}
		init();
	}
]);

mainModule.config(['$stateProvider', function($stateProvider) {


	}
]);

mainModule.run(['$rootScope','$state','$log', function($rootScope,$state,$log){
	$log.debug('"mainModule.run" complete ...');
	}
]);