/*
    Name: Dakota Miller
    Class: INFO 200
    Description: Javascript for "Connect"
*/

'use strict';

// Creates the Angular module and initializes the different states
angular.module('ConnectApp', ['ngSanitize', 'ui.router', 'ui.bootstrap'])
.config(function($stateProvider, $urlRouterProvider){
	$stateProvider
		.state('home', {
			url: '/', //"root" directory
			templateUrl: 'partials/home.html',
			controller: 'HomeCtrl'
		})
		.state('about', {
			url: '/about', 
			templateUrl: 'partials/about.html',
			controller: 'AboutCtrl'
		})
		.state('jobs', {
			url: '/jobs',
			templateUrl: 'partials/jobs.html',
			controller: 'JobsCtrl'
		})	
		.state('form', {
			url: '/form',
			templateUrl: 'partials/form.html',
			controller: 'FormCtrl'
		})	
		.state('details', {
			url: '/jobs/{id}',
			templateUrl: 'partials/details.html',
			controller: 'DetailsCtrl'
		});
	// Moves the user to the home page for any other valid url
	$urlRouterProvider.otherwise('/');

})

// Controller for home page
.controller('HomeCtrl', ['$scope', '$http', function($scope, $http) {

}])

// Controller for about page
.controller('AboutCtrl', ['$scope', '$http', function($scope, $http) {

}])

// Controller for job listings page
.controller('JobsCtrl', ['$scope', '$http', function($scope, $http) {

	$scope.mode = "volunteer";
	$scope.paid = [];
	$scope.volunteer = [];

	// Gets the data about the different jobs
	$http.get('data/data.json').then(function(response) {
 		$scope.jobs = response.data;
 		for(var i = 0; i < response.data.length; i++) {
 			if(response.data[i].payment == "none") {
 				$scope.volunteer.push(response.data[i]);
 			} else {
 				$scope.paid.push(response.data[i]);
 			}
 		}
 	});


}])

// Controller for cart page
.controller('FormCtrl', ['$scope', '$http', '$uibModal', function($scope, $http, $uibModal) {

	$scope.mode = "paid";


	$scope.finish = function() {
		var modalInstance = $uibModal.open({
			templateUrl: "partials/modal.html",
			controller: "ModalCtrl",
			scope: $scope
		});

	}
}])

// Controller for bean detail pages
.controller('DetailsCtrl', ['$scope', '$http', '$stateParams', '$filter', function($scope, $http, $stateParams, $filter) {

	// Gets the details of the first job that matches the filter
	$http.get('data/data.json').then(function(response) {
	   	$scope.job = $filter('filter')(response.data, { //filter the array
	    	id: $stateParams.id //for items whose id property is targetId
	   	}, true)[0]; //save the 0th result
 	});

}])

// Controller for modal
.controller('ModalCtrl', function($scope, $http, $uibModalInstance) {

	//Closes the modal
	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
})

