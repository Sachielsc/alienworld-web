'use strict';

angular.module('report').config(['$stateProvider', function($stateProvider) {
    console.log('report routers loading complete...');

    $stateProvider
        // router my reports in workreport state
        .state('workreport.report1',{
        url:'/report1',
        templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m1.view.html',
        })

        .state('workreport.report2',{
        url:'/report2',
        templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m2.view.html',
        })

        .state('workreport.report3',{
        url:'/report3',
        templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m3.view.html',
        })

        .state('workreport.report4',{
        url:'/report4',
        templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m4.view.html',
        })

        .state('workreport.report5',{
        url:'/report5',
        templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m5.view.html',
        })

        .state('workreport.report6',{
        url:'/report6',
        templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m6.view.html',
        })

        .state('workreport.report7',{
        url:'/report7',
        templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m7.view.html',
        })

        .state('workreport.report8',{
        url:'/report8',
        templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m8.view.html',
        })

        .state('workreport.report9',{
        url:'/report9',
        templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m9.view.html',
        })

        .state('workreport.report10',{
        url:'/report10',
        templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m10.view.html',
        })

        .state('workreport.report11',{
        url:'/report11',
        templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m11.view.html',
        })

        .state('workreport.report12',{
        url:'/report12',
        templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m12.view.html',
        })

        .state('workreport.report13',{
        url:'/report13',
        templateUrl:'app/modules/report/views/own-report/alienworld-report-m13.view.html',
        })

        .state('workreport.report14',{
        url:'/report14',
        templateUrl:'app/modules/report/views/own-report/alienworld-report-m14.view.html',
        })

        .state('workreport.report15',{
        url:'/report15',
        templateUrl:'app/modules/report/views/own-report/alienworld-report-m15.view.html',
        })

        .state('workreport.report16',{
        url:'/report16',
        templateUrl:'app/modules/report/views/own-report/alienworld-report-m16.view.html',
        })

        .state('workreport.report17',{
        url:'/report17',
        templateUrl:'app/modules/report/views/own-report/alienworld-report-m17.view.html',
        })

        .state('workreport.report18',{
        url:'/report18',
        templateUrl:'app/modules/report/views/own-report/alienworld-report-m18.view.html',
        })

        .state('workreport.report19',{
        url:'/report19',
        templateUrl:'app/modules/report/views/own-report/alienworld-report-m19.view.html',
        })

        .state('workreport.noteNodeJS',{
        url:'/noteNodeJS',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-noteNodeJS.view.html',
        })

        .state('workreport.angularjsArticle',{
        url:'/angularjs',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-angularjs.view.html',
        })

        .state('workreport.html',{
        url:'/html',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-html.view.html',
        })

        .state('workreport.bootstrap',{
        url:'/bootstrap',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-bootstrap.view.html',
        })

        .state('workreport.generalCoding',{
        url:'/generalCoding',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-general-coding.html',
        })

        .state('workreport.generalIT',{
        url:'/generalIT',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-general-IT.html',
        })

        .state('workreport.vocabulary',{
        url:'/vocabulary',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-vocabulary.view.html',
        })

        .state('workreport.java',{
        url:'/java',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-java.view.html',
        })

        .state('workreport.vim',{
        url:'/vim',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-vim.view.html',
        })
        
        .state('workreport.jira',{
        url:'/jira',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-jira.view.html',
        })

        .state('workreport.reactjs',{
        url:'/reactjs',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-reactJS.view.html',
        })

        .state('workreport.linux',{
        url:'/linux',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-Linux.view.html',
        })

        .state('workreport.gulp',{
        url:'/gulp',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-Gulp.view.html',
        })

        .state('workreport.sublime',{
        url:'/sublime',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-sublime.view.html',
        })

        .state('workreport.git',{
        url:'/git',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-git.view.html',
        })

        .state('workreport.heroku',{
        url:'/heroku',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-heroku.view.html',
        })
        ;
    }
]);