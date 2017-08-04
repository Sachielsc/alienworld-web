'use strict';

angular.module('community').config(['$stateProvider', function($stateProvider) {
	console.log('community routers loading complete...');

	$stateProvider
	.state('community', {
		url:'/community',
		// controller:'communityController',
		templateUrl:'app/modules/community/views/alienworld-community.view.html',
	})

	.state('community.carticle1',{
	url:'/carticle1',
	templateUrl:'app/modules/community/articles/carticle1.view.html',
	})

	.state('community.carticle2',{
	url:'/carticle2',
	templateUrl:'app/modules/community/articles/carticle2.view.html',
	})

	.state('community.carticle3',{
	url:'/carticle3',
	templateUrl:'app/modules/community/articles/carticle3.view.html',
	})

	.state('community.carticle4',{
	url:'/carticle4',
	templateUrl:'app/modules/community/articles/carticle4.view.html',
	})

	;}
]);