'use strict';
angular.module('home').config(['$stateProvider',
	function($stateProvider) {
		$stateProvider
		.state('home',{
			url:'home',
			// controller:'homeController',
			templateUrl:'app/modules/home/views/alienworld-home.view.html',
		});
	}
])
