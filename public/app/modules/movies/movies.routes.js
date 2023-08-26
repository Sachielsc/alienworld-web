'use strict';

angular.module('movies').config(['$stateProvider', function ($stateProvider) {
    console.log('movie routers loading complete...');

    $stateProvider
        .state('movies', {
            url: '/movies',
            controller: 'movieController',
            templateUrl: 'app/modules/movies/views/alienworld-movies.view.html',
        });
}
]);