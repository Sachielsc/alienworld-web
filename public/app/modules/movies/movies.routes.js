'use strict';

angular.module('movies').config(['$stateProvider', function($stateProvider) {
	console.log('game routers loading complete...');

	$stateProvider
	.state('movies', {
		url:'/movies',
		// controller:'type controller name here',
		templateUrl:'app/modules/movies/views/alienworld-movies.view.html',
	});
	}
]);