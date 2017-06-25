'use strict';

var mainModule = angular.module('alienworld',['ui.router', 'ngAnimate', 'movies', 'games', 'community', 'about']);

mainModule.controller('MainController', ['$scope','$log', function($scope,$log){
		function init(){
			$log.debug('initialization complete...');
			// put initialization code here
		}
		init();
	}
]);

mainModule.config(['$stateProvider', function($stateProvider) {
		
		$stateProvider
		.state('home',{
			url:'/home',
			// controller:'homeController',
			templateUrl:'app/modules/home/views/alienworld-home.view.html',
		});

		console.log('"mainModule.config" complete ...');
	}
]);

mainModule.run(['$rootScope','$state','$log', function($rootScope,$state,$log){
	$log.debug('"mainModule.run" complete ...');
	}
]);