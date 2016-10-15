'use strict';
 
angular.module('myApp.settings', ['ngRoute'])
// Home controller
.controller('SettingsCtrl', ["$scope", "$firebaseArray", "CurrentUserRef", "socket", 
	function($scope, $firebaseArray, CurrentUserRef, socket) {
		var modulesRef = CurrentUserRef.child('modules');
	    $scope.modules = $firebaseArray(modulesRef);
		var firebaseObj = firebase.database().ref();
		
		// Save threshold settings for modules
		$scope.saveSettings = function() {
			for (var i = 0; i < $scope.modules.length; i++) {
				$scope.modules.$save(i);
			}
		};

		// Push Notification Enabler
		$scope.pushButton = function() {
			if (isPushEnabled) {
			  unsubscribe();
			} else {
			  subscribe();
			}
		};

		// Push Notification Test (Delete this code later)
		$scope.pushNotificationTest = function() {
			socket.emit('testPushNotifications');
		};

		// Check that service workers are supported, if so, progressively
		// enhance and add push messaging support, otherwise continue without it.
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
		}
	}
]);

