'use strict';
 
angular.module('myApp.dashboard', ['ngRoute'])
// Home controller
.controller('DashboardCtrl', ["$scope", "Auth", function($scope, Auth) {
	var firebaseObj = firebase.database().ref();
}]);