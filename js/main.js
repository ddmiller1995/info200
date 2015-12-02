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

.controller('IndexCtrl', function($scope, $http, $uibModal, UserService) {
	
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
		UserService.logout();
	}

	$scope.user = UserService.user;

})

// Controller for home page
.controller('HomeCtrl', function($scope, $http, UserService) {


})

// Controller for about page
.controller('AboutCtrl', function($scope, $http) {

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
.controller('FormCtrl', function($scope, $http, $uibModal, UserService) {

	$scope.mode = "paid";
	$scope.user = UserService.user;

	$scope.finish = function() {
		var modalInstance = $uibModal.open({
			templateUrl: "partials/modal.html",
			controller: "ModalCtrl",
			scope: $scope
		});
	}
})

// Controller for bean detail pages
.controller('DetailsCtrl', function($scope, $http, $stateParams, $filter) {

	// Gets the details of the first job that matches the filter
	$http.get('data/data.json').then(function(response) {
	   	$scope.job = $filter('filter')(response.data, { //filter the array
	    	id: $stateParams.id //for items whose id property is targetId
	   	}, true)[0]; //save the 0th result
 	});

})

.controller('ModalCtrl', function($scope, $http, $uibModalInstance, UserService) {

	$scope.signup = function() {
		UserService.signup($scope.newUserDetails);
		$uibModalInstance.dismiss('cancel');
	}

	$scope.signin = function() {
		console.log("here");
		UserService.signin($scope.loginEmail, $scope.loginPass);
		$uibModalInstance.dismiss('cancel');
	}

	//Closes the modal
	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
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

