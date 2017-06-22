'use strict';

var mainModule = angular.module('alienworld',['ui.router', 'movies', 'games', 'community', 'about']);

mainModule.controller('MainController', ['$scope','$log', function($scope,$log){
		$log.debug('mainModule.controller');
		function init(){
			// put some initialization code here
		}

		init();
	}
]);

mainModule.config(['$stateProvider', function($stateProvider) {
		$stateProvider
		// .state('manage',{
		// 	url:'/manage',
		// 	controller:function($state){
		// 	 	//Render child view
		// 		if($state.current.name==='manage'){
		// 			$state.go("manage.home");
		// 		}
		// 	},
		// 	templateUrl:'app/modules/manage/views/manage-side-nav.view.html',
		// 	data: {
		// 		authRequired: true
  //           }
		// })
		.state('home',{
			url:'/home',
			// controller:'homeController',
			templateUrl:'app/modules/home/views/alienworld-home.view.html',
		})
		.state('movies',{
			url:'/movies',
			// controller:'moviesController',
			templateUrl:'app/modules/movies/views/alienworld-movies.view.html',
		})
		.state('games',{
			url:'/games',
			// controller:'gamesController',
			templateUrl:'app/modules/games/views/alienworld-games.view.html',
		})
		.state('community',{
			url:'/community',
			// controller:'communityController',
			templateUrl:'app/modules/report/views/alienworld-report-m11.view.html',
		})
		.state('about',{
			url:'/about',
			// controller:'aboutController',
			templateUrl:'app/modules/about/views/alienworld-about.view.html',
		});

		console.log('mainModule.config');
	}
]);

mainModule.run(['$rootScope','$state','$log', function($rootScope,$state,$log){
	$log.debug('mainModule.run');
	}
]);