'use strict';

angular.module('report').config(['$stateProvider', function($stateProvider) {
	console.log('report routers loading complete...');

	$stateProvider
		// router my reports in worklog state
		.state('worklog.report1',{
		url:'/report1',
		templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m1.view.html',
		})

		.state('worklog.report2',{
		url:'/report2',
		templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m2.view.html',
		})

		.state('worklog.report3',{
		url:'/report3',
		templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m3.view.html',
		})

		.state('worklog.report4',{
		url:'/report4',
		templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m4.view.html',
		})

		.state('worklog.report5',{
		url:'/report5',
		templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m5.view.html',
		})

		.state('worklog.report6',{
		url:'/report6',
		templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m6.view.html',
		})

		.state('worklog.report7',{
		url:'/report7',
		templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m7.view.html',
		})

		.state('worklog.report8',{
		url:'/report8',
		templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m8.view.html',
		})

		.state('worklog.report9',{
		url:'/report9',
		templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m9.view.html',
		})

		.state('worklog.report10',{
		url:'/report10',
		templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m10.view.html',
		})

		.state('worklog.report11',{
		url:'/report11',
		templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m11.view.html',
		})

		.state('worklog.report12',{
		url:'/report12',
		templateUrl:'app/modules/report/views/funtown-report/alienworld-report-m12.view.html',
		})

		.state('worklog.report13',{
		url:'/report13',
		templateUrl:'app/modules/report/views/own-report/alienworld-report-m13.view.html',
		})

		.state('worklog.report14',{
		url:'/report14',
		templateUrl:'app/modules/report/views/own-report/alienworld-report-m14.view.html',
		})

		.state('worklog.report15',{
		url:'/report15',
		templateUrl:'app/modules/report/views/own-report/alienworld-report-m15.view.html',
		})

		.state('worklog.report16',{
		url:'/report16',
		templateUrl:'app/modules/report/views/own-report/alienworld-report-m16.view.html',
		})

		.state('worklog.report17',{
		url:'/report17',
		templateUrl:'app/modules/report/views/own-report/alienworld-report-m17.view.html',
		})

		.state('worklog.noteNodeJS',{
		url:'/noteNodeJS',
		templateUrl:'app/modules/report/views/own-note/alienworld-note-noteNodeJS.view.html',
		})

		.state('worklog.angularjsArticle',{
		url:'/angularjsArticle',
		templateUrl:'app/modules/report/views/own-note/alienworld-note-angularjsArticle.view.html',
		})

		.state('worklog.html',{
		url:'/html',
		templateUrl:'app/modules/report/views/own-note/alienworld-note-html.view.html',
		})

		.state('worklog.bootstrap',{
		url:'/bootstrap',
		templateUrl:'app/modules/report/views/own-note/alienworld-note-bootstrap.view.html',
		})

		.state('worklog.generalCoding',{
		url:'/generalCoding',
		templateUrl:'app/modules/report/views/own-note/alienworld-note-general-coding.html',
		})

		.state('worklog.generalIT',{
		url:'/generalIT',
		templateUrl:'app/modules/report/views/own-note/alienworld-note-general-IT.html',
		})

		.state('worklog.vocabulary',{
		url:'/vocabulary',
		templateUrl:'app/modules/report/views/own-note/alienworld-note-vocabulary.view.html',
		})

		.state('worklog.java',{
		url:'/java',
		templateUrl:'app/modules/report/views/own-note/alienworld-note-java.view.html',
		})

		.state('worklog.jira',{
		url:'/jira',
		templateUrl:'app/modules/report/views/own-note/alienworld-note-jira.view.html',
		})

		.state('worklog.reactjs',{
		url:'/reactjs',
		templateUrl:'app/modules/report/views/own-note/alienworld-note-reactJS.view.html',
		})

		;
	}
]);