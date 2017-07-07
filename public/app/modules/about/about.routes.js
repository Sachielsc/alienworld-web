'use strict';

angular.module('about').config(['$stateProvider', function($stateProvider) {
	console.log('about routers loading complete...');

	$stateProvider
		.state('about',{
			url:'/about/statepanel',
			// controller:'aboutController',
			templateUrl:'app/modules/about/views/alienworld-about-statepanel.view.html',
		})

		.state('skillpanel',{
			url:'/about/skillpanel',
			// controller:'aboutController',
			templateUrl:'app/modules/about/views/alienworld-about-skillpanel.view.html',
		})

		.state('cv',{
			url:'/about/cv',
			// controller:'aboutController',
			templateUrl:'app/modules/about/views/alienworld-about-cv.view.html',
		})

		.state('cvfull',{
			url:'/about/cv-fullpage',
			// controller:'aboutController',
			templateUrl:'app/modules/about/views/alienworld-about-cvbody.view.html',
		})

		.state('contactme',{
			url:'/about/contactme',
			// controller:'aboutController',
			templateUrl:'app/modules/about/views/alienworld-about-contactme.view.html',
		})

		.state('worklog',{
			url:'/about/worklog',
			// controller:'workLogController',
			templateUrl:'app/modules/about/views/alienworld-about-worklog.view.html',
		});
	}
]);