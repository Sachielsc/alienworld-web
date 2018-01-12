'use strict';

angular.module('report').config(['$stateProvider', function ($stateProvider) {
    console.log('report routers loading complete...');

    // add my own study notes
    var studyNoteList = ["nodeJS", "angularJS", "html", "bootstrap", "generalCoding", "generalIT", "vocabulary", "java", "vim", "jira", "reactJS", "linux", "gulp", "sublime", "git", "heroku", "aspnet", "IntelliJIDEA", "javascript", "ISTQB-foundation", "selenium"];

    for (var j = 0; j < studyNoteList.length; j++) {
        var studyNoteStateName = "workreport." + studyNoteList[j];
        var studyNoteUrlName = "/" + studyNoteList[j];
        var studyNoteTemplateUrlName = "app/modules/report/views/own-note/alienworld-note-" + studyNoteList[j] + ".view.html";

        $stateProvider.state(
            studyNoteStateName, {
                url: studyNoteUrlName,
                templateUrl: studyNoteTemplateUrlName
            });
    }

    // add my code snippets
    var codeSnippetList = ["arraySum"];

    for (var k = 0; k < codeSnippetList.length; k++) {
        var codeSnippetStateName = "workreport." + codeSnippetList[k];
        var codeSnippetUrlName = "/" + codeSnippetList[k];
        var codeSnippetTemplateUrlName = "app/modules/report/views/code-snippet/code-snippet-" + codeSnippetList[k] + ".view.html";

        $stateProvider.state(
            codeSnippetStateName, {
                url: codeSnippetUrlName,
                templateUrl: codeSnippetTemplateUrlName
            });
    }

    // add work report routers
    var reportNum = 19;
    for (var i = 1; i <= reportNum; i++) {
        var stateName = "workreport.report" + i;
        var urlName = "/report" + i;
        var templateUrlName = "app/modules/report/views/work-report/alienworld-report-m" + i + ".view.html";

        $stateProvider.state(
            stateName, {
                url: urlName,
                templateUrl: templateUrlName
            });
    }
}
]);