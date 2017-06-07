'use strict';
angular.module('alienworld').controller('MainController', ['$scope','$log','AuthService', 'ProductService',
	function($scope,$log,AuthService,ProductService){
		$log.debug('mainController');
		var productCatalog = [];
		function init(){
			$scope.searchBox = {};
			$scope.searchBox.catalogOverview = [];
			$scope.searchBox.productName = '';
		}
		$scope.username = function(){
			return AuthService.getUserName();
		}
		$scope.isAuthenticated = function(){
			return AuthService.isAuthenticated();
		}
		$scope.contentTransfer = function(content){
			return JSON.parse(content);
		}
		$scope.searchProductForCatalog = function(productName){
			productCatalog = [];
			if(productName.length > 0){
				ProductService.searchProductForCatalog(productName).then(function(response){
					response.data.forEach(function(item){
						productCatalog.push(item.categoryName);
					});

					console.log(productCatalog)
					return productCatalog;
				});
			}
		}
		init();
	}
])