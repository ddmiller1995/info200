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
            url: '/profile',
            templateUrl: 'partials/profile.html',
            controller: 'ProfileCtrl'
        });		
	// Moves the user to the home page for any other valid url
	$urlRouterProvider.otherwise('/');

})

.controller('IndexCtrl', function($scope, $http, $uibModal, UserService, BasicService) {
	
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
		//UserService.logout();
		BasicService.unAuthenticate();
	}

	$scope.status = BasicService;
	//$scope.user = UserService.user;

})

// Controller for home page
.controller('HomeCtrl', function($scope, $http) {

})


// Controller for job listings page
.controller('JobsCtrl', function($scope, $http) {

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


})

// Controller for cart page
.controller('FormCtrl', function($scope, $http, $uibModal, UserService, BasicService) {

	$scope.mode = "paid";
	$scope.user = UserService.user;
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

	var mySavedJobsIds = BasicService.mySavedJobs;
	var myPostedJobsIds = BasicService.myPostedJobs;
	console.log(mySavedJobsIds);

	$scope.mySavedJobs = [];
	$scope.myPostedJobs = [];

	$http.get('data/data.json').then(function(response) {
	   	for(var i = 0; i < mySavedJobsIds.length; i++) {
		   	var job = $filter('filter')(response.data, { 
		    	id: mySavedJobsIds[i]
		   	}, true)[0];
		   	$scope.mySavedJobs.push(job);
		}
		for(var i = 0; i < myPostedJobsIds.length; i++) {
		   	var job = $filter('filter')(response.data, { 
		    	id: mySavedPostedIds[i]
		   	}, true)[0];
		   	$scope.myPostedJobs.push(job);
		}
		console.log($scope.mySavedJobs);
 	});

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

.controller('ProfileCtrl', function($scope, $http, BasicService) {


})

.controller('ModalCtrl', function($scope, $http, $uibModalInstance, UserService, BasicService) {

	// $scope.signup = function() {
	// 	UserService.signup($scope.newUserDetails);
	// }
	$scope.finished = false;
	// $scope.signin = function() {
	// 	console.log("here");
	// 	UserService.signin($scope.loginEmail, $scope.loginPass);
	// }

	$scope.pretendToAuthenticate = function() {
		//for(var i = 0; i < 9999; i++) {}
        BasicService.authenticate();
        setTimeout(function() {
            
            setTimeout(function(){
                $scope.cancel();
            }, 2500);
            $scope.finished = true;
        }, 1000);

        
	}

	//Closes the modal
	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
})

.factory('BasicService', function() {
	var service = {};
	service.loggedIn = false;
	service.mySavedJobs = [];
	service.myPostedJobs = [];

	service.authenticate = function(name) {
		service.loggedIn = true;
	}

	service.unAuthenticate = function() {
		service.loggedIn = false;
	}

	service.save = function(id) {
		service.mySavedJobs.push(id);
	}

	service.post = function(id) {
		service.myPostedJobs.push(id);
	}

	return service;

})

.factory('SystemService', function() {
    var service = {};
    service.ref = new Firebase("https://connect-test-info200.firebaseio.com");
    var callbacks = [];
    service.addCall = function(call) {
        callbacks.push(call);
    };
    service.execCalls = function() {
        callbacks.forEach(function(call) {
            call();
        });
    };
    return service;
})

.factory('UserService', function($firebaseObject, $firebaseAuth, SystemService) {
    var service = {};
    var Auth = $firebaseAuth(SystemService.ref);
    var usersRef = SystemService.ref.child('users');

    var users = $firebaseObject(usersRef);
    service.user = {};
    service.finished = false;

    service.getUser = function(id) {
        return users[id];
    };

    service.signup = function (newUserDetails) {
        console.log("creating user " + newUserDetails.name);

        Auth.$createUser({
                'email': newUserDetails.email,
                'password': newUserDetails.pass
            })
            .then(service.signin(newUserDetails.email, newUserDetails.pass)).then(function (authData) {

                if (!service.user.name) {
                    service.user.name = newUserDetails.name;
                }

                if (!service.user.phone) {
                    service.user.phone = newUserDetails.phone;
                }

                users[authData.uid] = {
                    'name': service.user.name,
                    'phone': service.user.phone
                };

                users.$save();

                service.user.userId = authData.uid;
                console.log(service.user);
                service.finished = true;
            })
            .catch(function (error) {
            	service.error = error;
                console.log(error);
            });
    };

    service.signin = function (email, password) {
        console.log('signing in ' + email);
        
        return Auth.$authWithPassword({
            'email': email,
            'password': password
        });
    };

    service.logout = function () {
        Auth.$unauth();
    };

    Auth.$onAuth(function (authData) {
        if (authData) {
            service.user.userId = authData.uid;
            users.$loaded(function() {
                service.user.name = users[authData.uid].name;
            });
        } else {
            service.user.userId = undefined;
            service.user.name = undefined;
        }
        SystemService.execCalls();
    });

    service.isLoggedIn = function() {
        return service.user.userId !== undefined;
    };

    // service.requireLogin = function($location) {
    //     if(!service.isLoggedIn()) {
    //         $location.path("/user/login");
    //     }
    // };

    return service;
});

