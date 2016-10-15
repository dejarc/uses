'use strict';
 
angular.module('myApp.settings', ['ngRoute'])
// Home controller
.controller('SettingsCtrl', ["$scope", "$firebaseArray", "CurrentUserRef", function($scope, $firebaseArray, CurrentUserRef) {
		
	var modulesRef = CurrentUserRef.child('modules');
    $scope.modules = $firebaseArray(modulesRef);
	var firebaseObj = firebase.database().ref();
	
	$scope.pushButton = function() {
		if (isPushEnabled) {
		  unsubscribe();
		} else {
		  subscribe();
		}
	};
	
	$scope.saveSettings = function() {
		alert("SAVE STUFF!");
	};

	// Check that service workers are supported, if so, progressively
	// enhance and add push messaging support, otherwise continue without it.
	/*if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('pushjs/service-worker.js')
		.then(initialiseState)
		.catch(function(error) {
			console.log("error? " + error);
		});;
	}*/
	
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('service-worker.js', {scope: '/'})
		  .then(function (registration) {
			var serviceWorker;
			if (registration.installing) {
			  serviceWorker = registration.installing;
			} else if (registration.waiting) {
			  serviceWorker = registration.waiting;
			} else if (registration.active) {
			  serviceWorker = registration.active;
			}

			if (serviceWorker) {
			  console.log("ServiceWorker phase:", serviceWorker.state);

			  serviceWorker.addEventListener('statechange', function (e) {
				console.log("ServiceWorker phase:", e.target.state);
			  });
			}
			initialiseState();
		  }).catch(function (err) {
			console.log('ServiceWorker registration failed: ', err);
		  });
		/*
	  navigator.serviceWorker.register('pushjs/service-worker.js').then(function(registration) {
		//Registration was successful
		console.log('ServiceWorker registration successful with scope: ', registration.scope);
	  }).catch(function(err) {
		//registration failed :(
		console.log('ServiceWorker registration failed: ', err);
	  });
	  */
	}
}]);

