'use strict';

angular.module('community').config(['$stateProvider', function($stateProvider) {
	console.log('community routers loading complete...');

	$stateProvider
	.state('community', {
		url:'/community',
		// controller:'communityController',
		templateUrl:'app/modules/community/views/alienworld-community.view.html',
	});
	}
]);