'use strict';
 
angular.module('myApp.home', ['ngRoute'])
// Home controller
.controller('HomeCtrl', ["$scope", "$location", "Auth", function($scope, $location, Auth) {
	var firebaseObj = firebase.database().ref();

	$scope.auth = Auth;
    // any time auth state changes, add the user data to scope
    $scope.auth.$onAuthStateChanged(function(firebaseUser) {
     	$scope.firebaseUser = firebaseUser;
    });

	$scope.error = '';
	
	$scope.SignIn = function(event) {
	    event.preventDefault();  // To prevent form refresh
	    var username = $scope.user.email;
	    var password = $scope.user.password;

		firebase.auth().signInWithEmailAndPassword(username, password).then(function(result) {
			var uid = result.uid;
      		$location.path("/dashboard");
		}).catch(function(error){ 
			var errorCode = error.code;
			var errorMessage = error.message;
			console.log(errorMessage);
			$scope.showDetails = true;
			$scope.error = errorMessage;
		})
	}
}]);