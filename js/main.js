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
	
	$scope.signup = function() {
		var modalInstance = $uibModal.open({
			templateUrl: "partials/signup.html",
			controller: "ModalCtrl",
			scope: $scope
		});
	}
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

// Controller for cart page
.controller('FormCtrl', function($scope, $http, $uibModal, BasicService) {

	$scope.mode = "paid";
	$scope.status = BasicService;
	$scope.finish = function() {
		var modalInstance = $uibModal.open({
			templateUrl: "partials/modal.html",
			controller: "ModalCtrl",
			scope: $scope
		});
	}
})

// Controller for bean detail pages
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

 	$scope.save = function() {
 		BasicService.save($scope.job.id);
 		$scope.message = "Saved!"
 		$scope.finished = true;

 	}

})

.controller('MyJobsCtrl', function($scope, $http, $filter, BasicService) {
	$scope.mode = "saved";
	$scope.status = BasicService;

	var mySavedJobsIds = BasicService.mySavedJobs;
	var myPostedJobsIds = BasicService.myPostedJobs;

	$scope.mySavedJobs = [];
	$scope.myPostedJobs = [];

	$http.get('data/data.json').then(function(response) {
		for(var i = 0; i < mySavedJobsIds.length; i++) {
		   	var job = $filter('filter')(response.data, { 
		    	id: mySavedJobsIds[i]
		   	}, true)[0];
		   	$scope.mySavedJobs.push(job);
		}
	});

	// I am so sorry for this. Ran out of time and it works
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
				console.log("here");
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

.controller('ProfileCtrl', function($scope, $http, $uibModal, $stateParams, $filter, BasicService) {

	$http.get('data/users.json').then(function(response) {
	   	$scope.user = $filter('filter')(response.data, { 
	    	id: $stateParams.id 
	   	}, true)[0]; 
	});

	$scope.finish = function() {
		var modalInstance = $uibModal.open({
			templateUrl: "partials/profile-submit.html",
			controller: "ModalCtrl",
			scope: $scope
		});
	}

})

.controller('ModalCtrl', function($scope, $http, $uibModalInstance, BasicService) {

	$scope.finished = false;

	$scope.pretendToAuthenticate = function(email) {
		for(var i = 0; i < 10000; i++) {}
        BasicService.authenticate(email);

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
		$http.get('data/users.json').then(function(response) {
			var user;
		   	for(var i = 0; i < response.data.length; i++) {
			   	user = $filter('filter')(response.data, { 
			    	email: email
			   	}, true)[0];
			   	
			}
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

