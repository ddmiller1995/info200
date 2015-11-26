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

.controller('IndexCtrl', ['$scope', '$http', '$uibModal', function($scope, $http, $uibModal) {
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
}])

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
.controller('ModalCtrl', ['$scope', '$http', '$uibModalInstance', 'UserService', function($scope, $http, $uibModalInstance, $UserService) {

	$scope.login = function() {
		UserService.login($scope.loginEmail, $scope.loginPass)
	}	

	$scope.signup = function() {
		UserService.signup($scope.signupEmail, $scope.signupPass, $scope.signupName)
	}

	//Closes the modal
	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
}])

.factory('SystemService', function() {
    var service = {};
    service.ref = new Firebase("https://connect-info200.firebaseio.com/");
    return service;
})

.factory('UserService', function($firebaseObject, $firebaseAuth, SystemService) {
    var service = {};
    var Auth = $firebaseAuth(SystemService.ref);
    var usersRef = SystemService.ref.child('users');

    var users = $firebaseObject(usersRef);
    service.user = {};

    service.signup = function (email, password, name) {
        console.log("creating user " + email);

        Auth.$createUser({
                'email': email,
                'password': password
            })
            .then(service.signin).then(function (authData) {
                if (!service.user.avatar) {
                    service.user.avatar = "img/no-pic.png";
                }
                if (!service.user.name) {
                    service.user.name = name;
                }

                var newUserInfo = {
                    'avatar': service.user.avatar,
                    'name': service.user.name
                };
                users[authData.uid] = newUserInfo;

                users.$save();

                service.user.userId = authData.uid;
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    service.signin = function (email, password) {
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
        } else {
            service.user.userId = undefined;
        }
    });

    service.isLoggedIn = function() {
        return service.userId !== undefined;
    };

    return service;
});

