'use strict';
angular.module('report').config(['$stateProvider',
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
