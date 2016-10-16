'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'firebase',
  'myApp.home',
  'myApp.dashboard',
  'myApp.logs',
  'myApp.settings',
  'myApp.addModule',
  'myApp.contact',
  'myApp.about',
  'myApp.sidebar'
])
.run(["$rootScope", "$location", "$window", "Auth", function($rootScope, $location, $window, Auth) {
  // Force SSL
  if ($location.protocol() !== 'https' && !($location.host() === "localhost" || $location.host() === "127.0.0.1")) {
      $window.location.href = $location.absUrl().replace('http', 'https');
  }

  Auth.$onAuthStateChanged(function(firebaseUser) {
      if(!firebaseUser) {
          $location.path('/home');
      }
  });
  $rootScope.$on("$routeChangeSuccess", function(event) {
    if (Auth.$getAuth() && $location.$$path == '/home') {
      $location.path("/dashboard");
    } 
  });
  $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
    // We can catch the error thrown when the $requireSignIn promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $location.path("/home");
    }
  });
}])
.config(['$routeProvider', function($routeProvider) {
	// Set default view of our app to home
	$routeProvider.when('/home', {
      templateUrl: 'view/home.html',
      controller: 'HomeCtrl',
      resolve: {
        // controller will not be loaded until $waitForSignIn resolves
        // Auth refers to our $firebaseAuth wrapper in the factory below
        "currentAuth": ["Auth", function(Auth) {
          // $waitForSignIn returns a promise so the resolve waits for it to complete
          return Auth.$waitForSignIn();
        }]
      }
    })
    .when('/dashboard', {
      templateUrl: 'view/dashboard.html',
      controller: 'DashboardCtrl'/*,//removed for testing purposes, will add back in
      resolve: {
        // controller will not be loaded until $waitForSignIn resolves
        // Auth refers to our $firebaseAuth wrapper in the factory below
        "currentAuth": ["Auth", function(Auth) {
          // $waitForSignIn returns a promise so the resolve waits for it to complete
          return Auth.$requireSignIn();
        }]
      }*/
    })
    .when('/logs', {
      templateUrl: 'view/logs.html',
      controller: 'LogsCtrl',
      resolve: {
        // controller will not be loaded until $waitForSignIn resolves
        // Auth refers to our $firebaseAuth wrapper in the factory below
        "currentAuth": ["Auth", function(Auth) {
          // $waitForSignIn returns a promise so the resolve waits for it to complete
          return Auth.$requireSignIn();
        }]
      }
    })
    .when('/settings', {
      templateUrl: 'view/settings.html',
      controller: 'SettingsCtrl',
      resolve: {
        // controller will not be loaded until $waitForSignIn resolves
        // Auth refers to our $firebaseAuth wrapper in the factory below
        "currentAuth": ["Auth", function(Auth) {
          // $waitForSignIn returns a promise so the resolve waits for it to complete
          return Auth.$requireSignIn();
        }]
      }
    })
    .when('/addModule', {
      templateUrl: 'view/add-module.html',
      controller: 'AddModuleCtrl',
      resolve: {
        // controller will not be loaded until $waitForSignIn resolves
        // Auth refers to our $firebaseAuth wrapper in the factory below
        "currentAuth": ["Auth", function(Auth) {
          // $waitForSignIn returns a promise so the resolve waits for it to complete
          return Auth.$requireSignIn();
        }]
      }
    })
    .otherwise({
  		redirectTo: '/home'
  	});
}])
.factory("Auth", ["$firebaseAuth", function($firebaseAuth) {
    return $firebaseAuth();
  }
])
.factory("CurrentUserRef", ["$firebaseAuth", function($firebaseAuth) {
    return firebase.database().ref('users/' + $firebaseAuth().$getAuth().uid);
  }
])
.factory('socket', ["$rootScope", "$firebaseAuth", function($rootScope, $firebaseAuth) {
  var socket = io("https://uses.herokuapp.com/" + $firebaseAuth().$getAuth().uid);
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
}]);
