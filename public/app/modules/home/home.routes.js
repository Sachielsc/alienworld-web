'use strict';
angular.module('home').config(['$stateProvider',
    function ($stateProvider) {

        console.log('home routers loading complete...');

        $stateProvider
            .state('home', {
                url: '/',
                controller: 'homeController',
                templateUrl: 'app/modules/home/views/alienworld-home.view.html',
            });
    }
])
