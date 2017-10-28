'use strict';

angular.module('report').config(['$stateProvider', function($stateProvider) {
    console.log('report routers loading complete...');

    // add my own study notes
    var studyNoteName = ["noteNodeJS", "angularJS", "html", "bootstrap", "generalCoding", "generalIT", "vocabulary", "java", "vim", "jira", "reactJS", "linux", "gulp", "sublime", "git", "heroku", "aspnet"];

    for (var j = 0; j < studyNoteName.length; j++) {
        var studyNoteStateName = "workreport." + studyNoteName[j];
        var studyNoteUrlName = "/" + studyNoteName[j];
        var studyNoteTemplateUrlName = "app/modules/report/views/own-note/alienworld-note-" + studyNoteName[j] + ".view.html";

        $stateProvider.state(
            studyNoteStateName ,{
                url: studyNoteUrlName,
                templateUrl: studyNoteTemplateUrlName
            });
    }

    // add work report routers
    var reportNum = 19;
    var reportCap = 12;
    for (var i = 1; i <= reportNum; i++) {
        var stateName = "workreport.report" + i;
        var urlName = "/report" + i;
        var templateUrlName = "";
        if (i <= reportCap)
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