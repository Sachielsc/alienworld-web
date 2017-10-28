'use strict';

angular.module('report').config(['$stateProvider', function($stateProvider) {
    console.log('report routers loading complete...');
    // add my own study notes
    $stateProvider
        .state('workreport.noteNodeJS',{
        url:'/noteNodeJS',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-noteNodeJS.view.html'
        })

        .state('workreport.angularjsArticle',{
        url:'/angularjs',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-angularjs.view.html'
        })

        .state('workreport.html',{
        url:'/html',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-html.view.html'
        })

        .state('workreport.bootstrap',{
        url:'/bootstrap',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-bootstrap.view.html'
        })

        .state('workreport.generalCoding',{
        url:'/generalCoding',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-general-coding.html'
        })

        .state('workreport.generalIT',{
        url:'/generalIT',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-general-IT.html'
        })

        .state('workreport.vocabulary',{
        url:'/vocabulary',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-vocabulary.view.html'
        })

        .state('workreport.java',{
        url:'/java',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-java.view.html'
        })

        .state('workreport.vim',{
        url:'/vim',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-vim.view.html'
        })
        
        .state('workreport.jira',{
        url:'/jira',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-jira.view.html'
        })

        .state('workreport.reactjs',{
        url:'/reactjs',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-reactJS.view.html'
        })

        .state('workreport.linux',{
        url:'/linux',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-Linux.view.html'
        })

        .state('workreport.gulp',{
        url:'/gulp',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-Gulp.view.html'
        })

        .state('workreport.sublime',{
        url:'/sublime',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-sublime.view.html'
        })

        .state('workreport.git',{
        url:'/git',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-git.view.html'
        })

        .state('workreport.heroku',{
        url:'/heroku',
        templateUrl:'app/modules/report/views/own-note/alienworld-note-heroku.view.html'
        })

        .state('workreport.aspnet',{
            url:'/aspnet',
            templateUrl:'app/modules/report/views/own-note/alienworld-note-aspnet.view.html'
        });

    // add funtown and my own report routers
    var reportNum = 19;
    for (var i = 1; i <= reportNum; i++) {
        var stateName = "workreport.report" + i;
        var urlName = "/report" + i;
        var templateUrlName = "";
        if (i <= 12)
        {
            templateUrlName = "app/modules/report/views/funtown-report/alienworld-report-m" + i + ".view.html";
        }
        else {
            templateUrlName = "app/modules/report/views/own-report/alienworld-report-m" + i + ".view.html";
        }

        $stateProvider.state(
            stateName ,{
                url: urlName,
                templateUrl: templateUrlName
            });
        }
    }
]);