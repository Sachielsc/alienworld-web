'use strict';
angular.module('about').config(['$stateProvider',
	function($stateProvider) {
		$stateProvider
		.state('login',{
			url:'/login',
			templateUrl:'app/modules/auth/views/login.view.html',
			controller:'LoginController',
			data: {
				authRequired: false
            }
		})
		.state('logout',{
			url:'/logout',
			controller:'LogoutController',
			data: {
				authRequired: false
            }
		})
		.state('register',{
			url:'/register',
			controller:'RegisterController',
			templateUrl:'app/modules/auth/views/register.view.html',
			data:{
				authrequired : false
			}
		}

		)
		.state('passwordRemainder',{
			url:'/passwordRemainder',
			controller:'passwordRemainderController',
			templateUrl:'app/modules/auth/views/passwordRemainder.view.html',
			data:{
				authrequired : false
			}
		}

		)
	}
])
