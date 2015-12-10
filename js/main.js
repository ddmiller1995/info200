/*
    Name: Dakota Miller
    Class: INFO 200
    Description: Javascript for "Connect"
*/

'use strict';

// Creates the Angular module and initializes the different states
angular.module('ConnectApp', ['ngSanitize', 'ui.router', 'ui.bootstrap', 'firebase'])
.config(function($stateProvider, $urlRouterProvider){
	$stateProvider
		.state('home', {
			url: '/', //"root" directory
			templateUrl: 'partials/home.html',
			controller: 'HomeCtrl'
		})
		.state('about', {
			url: '/about', 
			templateUrl: 'partials/about.html'
		})
		.state('help', {
			url: '/help', 
			templateUrl: 'partials/help.html'
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
		})
		.state('myjobs', {
			url: '/myjobs',
			templateUrl: 'partials/myjobs.html',
			controller: 'MyJobsCtrl'
		})        
        .state('profile', {
            url: '/profile/{id}',
            templateUrl: 'partials/profile.html',
            controller: 'ProfileCtrl'
        })
        .state('newProfile', {
            url: '/new-profile',
            templateUrl: 'partials/new-profile.html',
            controller: 'ProfileCtrl'
        });	;		
	// Moves the user to the home page for any other valid url
	$urlRouterProvider.otherwise('/');

})

.controller('IndexCtrl', function($scope, $http, $uibModal, BasicService) {
	
	// Opens the signup modal
	$scope.signup = function() {
		var modalInstance = $uibModal.open({
			templateUrl: "partials/signup.html",
			controller: "ModalCtrl",
			scope: $scope
		});
	}

	// Opens the login modal
	$scope.login = function() {
		var modalInstance = $uibModal.open({
			templateUrl: "partials/login.html",
			controller: "ModalCtrl",
			scope: $scope
		});
	}

	$scope.logout = function() {
		BasicService.unAuthenticate();
	}

	$scope.status = BasicService;

})

// Controller for home page
.controller('HomeCtrl', function($scope, $http) {

})


// Controller for job listings page
.controller('JobsCtrl', function($scope, $http) {

	$scope.mode = "volunteer";
	$scope.paid = [];
	$scope.volunteer = [];

	$scope.sortingCriteria = "title";
	$scope.searchQuery = "";

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

	// Switches between ascending or descending sorting for a criteria
 	$scope.setSortingCriteria = function(criteria) {
	    if ($scope.sortingCriteria === criteria) {
	        $scope.sortingCriteria = '-' + criteria;
	    } else if ($scope.sortingCriteria === '-' + criteria) {
	        $scope.sortingCriteria = criteria;
	    } else {
	        $scope.sortingCriteria = criteria;
	    }
	}
})

// Controller for form page
.controller('FormCtrl', function($scope, $http, $uibModal, BasicService) {

	$scope.mode = "paid";
	$scope.status = BasicService;

	// Opens the confirmation modal
	$scope.finish = function() {
		var modalInstance = $uibModal.open({
			templateUrl: "partials/modal.html",
			controller: "ModalCtrl",
			scope: $scope
		});
	}
})

// Controller for job detail pages
.controller('DetailsCtrl', function($scope, $http, $stateParams, $filter, BasicService) {

	// Gets the details of the first job that matches the filter
	$http.get('data/data.json').then(function(response) {
	   	$scope.job = $filter('filter')(response.data, { //filter the array
	    	id: $stateParams.id //for items whose id property is targetId
	   	}, true)[0]; //save the 0th result
 	});

 	$scope.status = BasicService;
 	$scope.message = "Save Job";
 	$scope.finished = false;

 	// Saves the current job ID to the service
 	$scope.save = function() {
 		BasicService.save($scope.job.id);
 		$scope.message = "Saved!"
 		$scope.finished = true;

 	}
})

// Controller for the myjobs page
.controller('MyJobsCtrl', function($scope, $http, $filter, BasicService) {
	$scope.mode = "saved";
	$scope.status = BasicService;

	var mySavedJobsIds = BasicService.mySavedJobs;
	var myPostedJobsIds = BasicService.myPostedJobs;

	$scope.mySavedJobs = [];
	$scope.myPostedJobs = [];

	// Gets the saved jobs from the JSON file using the jobs
	// marked as saved in the service
	$http.get('data/data.json').then(function(response) {
		for(var i = 0; i < mySavedJobsIds.length; i++) {
		   	var job = $filter('filter')(response.data, { 
		    	id: mySavedJobsIds[i]
		   	}, true)[0];
		   	$scope.mySavedJobs.push(job);
		}
	});

	// I am so sorry for this. Ran out of time and it works
	// It uses recursion to wait until the BasicService's asynchronous function
	// is done and then gets the posted jobs from the JSON 
	$scope.updateJob = function() {
		$scope.mode = "posted";
		$scope.myPostedJobs = [];
		if(BasicService.email != "") {
			$http.get('data/data.json').then(function(response) {
				for(var i = 0; i < myPostedJobsIds.length; i++) {
				   	var job = $filter('filter')(response.data, { 
				    	id: myPostedJobsIds[i]
				   	}, true)[0];
				   	$scope.myPostedJobs.push(job);
				}
 			});
		} else {
			setTimeout(function() {
            	updateJob();
        	}, 500);
			
		}
	}
	
    $scope.removeSaved = function(id) {
        for(var i = 0; i < $scope.mySavedJobs.length; i++) {
            if($scope.mySavedJobs[i].id == id) {
                $scope.mySavedJobs.splice(i, 1);
            }
        }
    }

    $scope.removePosted = function(id) {
        for(var i = 0; i < $scope.myPostedJobs.length; i++) {
            if($scope.myPostedJobs[i].id == id) {
                $scope.myPostedJobs.splice(i, 1);
            }
        }
    }
})

// Controller for the profile page
.controller('ProfileCtrl', function($scope, $http, $uibModal, $stateParams, $filter, BasicService) {

	// Gets profile data from the JSON for the current user
	$http.get('data/users.json').then(function(response) {
	   	$scope.user = $filter('filter')(response.data, { 
	    	id: $stateParams.id 
	   	}, true)[0]; 
	});

	// Opens the confirmation modal when the profile creation form is submitted
	$scope.finish = function() {
		var modalInstance = $uibModal.open({
			templateUrl: "partials/profile-submit.html",
			controller: "ModalCtrl",
			scope: $scope
		});
	}

})

// Controller for all the modals
.controller('ModalCtrl', function($scope, $http, $uibModalInstance, BasicService) {

	$scope.finished = false;

	// We don't actually have functional backend authentication for the demo site
	// Instead, the site saves the email and id until it is refreshed
	$scope.pretendToAuthenticate = function(email) {
		// Gives the impression that the site is working on login
		for(var i = 0; i < 10000; i++) {}
        BasicService.authenticate(email);

    	// Displays a confirmation message, then waits and closes the modal
    	$scope.finished = true;
        setTimeout(function() {
            $scope.cancel();
        }, 1500);
	}

	//Closes the modal
	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
})

// This service stores temporary data about the current user
.factory('BasicService', function($http, $filter) {
	var service = {};
	service.loggedIn = false;
	service.email = "";
	service.id = "na";
	service.mySavedJobs = [];
	service.myPostedJobs = [];

	service.authenticate = function(email) {
		service.loggedIn = true;
		service.email = email;
		// We have two sample users, this checks if the current email matches 
		// one of those accounts and then gets their data
		$http.get('data/users.json').then(function(response) {
			var user;
		   	for(var i = 0; i < response.data.length; i++) {
			   	user = $filter('filter')(response.data, { 
			    	email: email
			   	}, true)[0];
			   	
			}
			// If we matched one of our users, loads their posted jobs list
			if(user) {
				service.id = user.id;
				for(var i = 0; i < user.posted.length; i++) {
					service.myPostedJobs.push(user.posted[i]);
				}
			}
		});
		
	}

	service.unAuthenticate = function() {
		service.loggedIn = false;
		service.email = "";
	}

	service.save = function(id) {
		service.mySavedJobs.push(id);
	}

	service.post = function(id) {
		service.myPostedJobs.push(id);
	}

	return service;
});