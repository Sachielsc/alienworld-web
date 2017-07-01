'use strict';

angular.module('games').config(['$stateProvider', function($stateProvider) {
	console.log('game routers loading complete...');

	$stateProvider
	.state('games', {
		url:'/games',
		// controller:'type controller name here',
		templateUrl:'app/modules/games/views/alienworld-games.view.html',
	});
	}
]);