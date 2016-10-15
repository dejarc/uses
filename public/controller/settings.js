'use strict';
 
angular.module('myApp.settings', ['ngRoute'])
// Home controller
.controller('SettingsCtrl', ["$scope", function($scope) {
	var firebaseObj = firebase.database().ref();
	
	$scope.pushButton = function() {
		if (isPushEnabled) {
		  unsubscribe();
		} else {
		  subscribe();
		}
	};

	// Check that service workers are supported, if so, progressively
	// enhance and add push messaging support, otherwise continue without it.
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('pushjs/service-worker.js').then(initialiseState);
	}
}]);

