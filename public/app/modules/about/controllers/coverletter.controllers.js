'use strict';
angular.module('about').controller('coverletterController', ['$log', '$scope', function($log, $scope){
	$log.debug('"coverletterController" complete ...');
    
    $scope.hideCoverLetter = true;

    $scope.clearvalue = function () {
        $scope.coverletterpassword = "";
    }

    $scope.passvalue = function () {
        if ($scope.coverletterpassword=="scsgdtcy3") {
        	$scope.hideCoverLetter = false;
        } else {
        	$scope.hideCoverLetter = true;
        }
    }

    $scope.radiofunction = function () {
        if ($scope.coverlettertype == "intern") {
            $scope.prologue = "It is so exciting to see that " + $scope.companyname + " is looking for a " + $scope.posistionname + " on " + $scope.medium + ". Although I am very junior, I fall in love with coding from the day I start my first project, and I never stop practicing, literally. I will demonstrate a small part of my self-motivated projects in this cover letter. But more importantly, I am eager for an opportunity to put all my passion and effort into commercial production, even without a payment. If possible, please consider my application as an intern, and I WILL prove my value through hard work and fast improvement.";
        } else {
            if ($scope.coverlettertype == "junior") {
                $scope.prologue = "It is so exciting to see that " + $scope.companyname + " is looking for a " + $scope.posistionname + " on " + $scope.medium + ". I fall in love with coding from the day I start my first project, and I never stop practicing, literally. I will demonstrate a small part of my self-motivated projects in this cover letter. But more importantly, I am eager for an opportunity to put all my passion and effort into commercial production. Please consider my application and I WILL show my capability in this posistion through my hard wrok.";
            } else {
                if ($scope.coverlettertype == "recruitment") {
                    $scope.prologue = "It is so exciting to see that " + $scope.companyname + " is looking for a " + $scope.posistionname + " on " + $scope.medium + ". Although I am a junior developer, I fall in love with coding from the day I start my first project, and I never stop practicing, literally. I will demonstrate a small part of my self-motivated projects in this cover letter. I can see that " + $scope.companyname + " is doing well in the recruitment domain and you must have your resources. As for me, I have faith in my gift and passion. If possible, please consider my application, or even as an intern, and I WILL prove my value.";
                } else {
                    $scope.prologue = "Please select a cover letter type";
                }
            }
        }
    }
}]
)