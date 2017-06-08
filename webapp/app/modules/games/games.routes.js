'use strict';
angular.module('games').config(['$stateProvider',
	function($stateProvider) {
		$stateProvider
		.state('buy',{
			url:'/buy',
			templateUrl:'app/modules/buying/views/buy.view.html',
			data: {
				authRequired: true
            }
		})
	}
])
