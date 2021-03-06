'use strict';
 
angular.module('myApp.settings', ['ngRoute'])
// Home controller
.controller('SettingsCtrl', ["$scope", "$firebaseArray", "CurrentUserRef", "socket", "Auth",
	function($scope, $firebaseArray, CurrentUserRef, socket, Auth) {
		var modulesRef = CurrentUserRef.child('modules');
		$scope.modules = $firebaseArray(modulesRef);
		var firebaseObj = firebase.database().ref();
		$scope.subscribers = $firebaseArray(CurrentUserRef.child('subscribers'));
	
		// Save label and threshold settings for modules
		$scope.saveSettings = function() {
			for (var i = 0; i < $scope.modules.length; i++) {
				$scope.modules.$save(i).then(function() {
					//document.getElementById("save-success").style.display = 'inline';
					$('#save-success').slideDown();
				}, function(error) {
					console.log("Error:", error);
					//document.getElementById("save-failure").style.display = 'inline';
					$('#save-failure').slideDown();
				});;
			}
		};

		// Allows for dismissal of saving alerts
		$('.alert').on('click','.close',function(){
			$(this).closest('.alert').slideUp();
		});
		
		$scope.uid = Auth.$getAuth().uid;
		console.log(Auth.$getAuth().uid);



		// Setting up push notification functions
		var API_KEY = 'AIzaSyBXg0iMARMAPHsuo6iUPfIrPmUWUgHlDLE';
		var GCM_ENDPOINT = 'https://android.googleapis.com/gcm/send';

		// var curlCommandDiv = document.querySelector('.js-curl-command');
		var isPushEnabled = false;

		// This method handles the removal of subscriptionId
		// in Chrome 44 by concatenating the subscription Id
		// to the subscription endpoint
		function endpointWorkaround(pushSubscription) {
		  // Make sure we only mess with GCM
		  if (pushSubscription.endpoint.indexOf('https://android.googleapis.com/gcm/send') !== 0) {
		    return pushSubscription.endpoint;
		  }

		  var mergedEndpoint = pushSubscription.endpoint;
		  // Chrome 42 + 43 will not have the subscriptionId attached
		  // to the endpoint.
		  if (pushSubscription.subscriptionId &&
		    pushSubscription.endpoint.indexOf(pushSubscription.subscriptionId) === -1) {
		    // Handle version 42 where you have separate subId and Endpoint
		    mergedEndpoint = pushSubscription.endpoint + '/' +
		      pushSubscription.subscriptionId;
		  }
		  return mergedEndpoint;
		}

		function sendSubscriptionToServer(subscription) {
			// TODO: Send the subscription.endpoint
			// to your server and save it to send a
			// push message at a later date
			//
			// For compatibly of Chrome 43, get the endpoint via
			// endpointWorkaround(subscription)
			console.log('TODO: Implement sendSubscriptionToServer()');

			var mergedEndpoint = endpointWorkaround(subscription);

			// This is just for demo purposes / an easy to test by
			// generating the appropriate cURL command
			// showCurlCommand(mergedEndpoint);
		}

		// NOTE: This code is only suitable for GCM endpoints,
		// When another browser has a working version, alter
		// this to send a PUSH request directly to the endpoint
		function showCurlCommand(mergedEndpoint) {
		  // The curl command to trigger a push message straight from GCM
		  if (mergedEndpoint.indexOf(GCM_ENDPOINT) !== 0) {
		     console.log('This browser isn\'t currently ' +
		      'supported for this demo');
		    return;
		  }

		  var endpointSections = mergedEndpoint.split('/');
		  var subscriptionId = endpointSections[endpointSections.length - 1];

		  var curlCommand = 'curl --header "Authorization: key=' + API_KEY +
		    '" --header "Content-Type:application/json" ' + GCM_ENDPOINT +
		    ' -d "{\\"registration_ids\\":[\\"' + subscriptionId + '\\"]}"';

		  console.log(curlCommand); // curlCommandDiv.textContent = curlCommand; 
		}

		function unsubscribe() {
		  var pushButton = document.querySelector('.js-push-button');
		  pushButton.disabled = true;
		 // curlCommandDiv.textContent = '';

		  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
		    // To unsubscribe from push messaging, you need get the
		    // subcription object, which you can call unsubscribe() on.
		    serviceWorkerRegistration.pushManager.getSubscription().then(
		      function(pushSubscription) {
		        // Check we have a subscription to unsubscribe
		        if (!pushSubscription) {
		          // No subscription object, so set the state
		          // to allow the user to subscribe to push
		          isPushEnabled = false;
		          pushButton.disabled = false;
		          pushButton.textContent = 'Enable Push Messages';
		          return;
		        }

		        // TODO: Make a request to your server to remove
		        // the users data from your data store so you
		        // don't attempt to send them push messages anymore

		        // We have a subcription, so call unsubscribe on it
		        pushSubscription.unsubscribe().then(function() {
		          pushButton.disabled = false;
		          pushButton.textContent = 'Enable Push Messages';
		          isPushEnabled = false;
		        }).catch(function(e) {
		          // We failed to unsubscribe, this can lead to
		          // an unusual state, so may be best to remove
		          // the subscription id from your data store and
		          // inform the user that you disabled push

		           console.log('Unsubscription error: ', e);
		          pushButton.disabled = false;
		        });
		      }).catch(function(e) {
		         console.log('Error thrown while unsubscribing from ' +
		          'push messaging.', e);
		      });
		  });
		}

		function subscribe() {
		  // Disable the button so it can't be changed while
		  // we process the permission request
		  var pushButton = document.querySelector('.js-push-button');
		  pushButton.disabled = true;

		  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
		    serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
		      .then(function(subscription) {
		        // The subscription was successful
		        isPushEnabled = true;
		        pushButton.textContent = 'Disable Push Messages';
		        pushButton.disabled = false;
				$scope.subscribers.$add(subscription);
			    socket.emit('notificationSubscription', subscription);

		        // TODO: Send the subscription subscription.endpoint
		        // to your server and save it to send a push message
		        // at a later date
		        return sendSubscriptionToServer(subscription);
		      })
		      .catch(function(e) {
		        if (Notification.permission === 'denied') {
		          // The user denied the notification permission which
		          // means we failed to subscribe and the user will need
		          // to manually change the notification permission to
		          // subscribe to push messages
		           console.log('Permission for Notifications was denied');
		          pushButton.disabled = true;
		        } else {
		          // A problem occurred with the subscription, this can
		          // often be down to an issue or lack of the gcm_sender_id
		          // and / or gcm_user_visible_only
		           console.log('Unable to subscribe to push.', e);
		          pushButton.disabled = false;
		          pushButton.textContent = 'Enable Push Messages';
		        }
		      });
		  });
		}

		// Once the service worker is registered set the initial state
		function initialiseState() {
		  // Are Notifications supported in the service worker?
		  if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
		     console.log('Notifications aren\'t supported.');
		    return;
		  }

		  // Check the current Notification permission.
		  // If its denied, it's a permanent block until the
		  // user changes the permission
		  if (Notification.permission === 'denied') {
		     console.log('The user has blocked notifications.');
		    return;
		  }

		  // Check if push messaging is supported
		  if (!('PushManager' in window)) {
		     console.log('Push messaging isn\'t supported.');
		    return;
		  }

		  // We need the service worker registration to check for a subscription
		  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
		    // Do we already have a push message subscription?
		    serviceWorkerRegistration.pushManager.getSubscription()
		      .then(function(subscription) {
		        // Enable any UI which subscribes / unsubscribes from
		        // push messages.
		        var pushButton = document.querySelector('.js-push-button');
		        pushButton.disabled = false;

		        if (!subscription) {
		          // We aren’t subscribed to push, so set UI
		          // to allow the user to enable push
		          return;
		        }

		        // Keep your server in sync with the latest subscription
		        sendSubscriptionToServer(subscription);

		        // Set your UI to show they have subscribed for
		        // push messages
		        pushButton.textContent = 'Disable Push Messages';
		        isPushEnabled = true;

		      })
		      .catch(function(err) {
		         console.log('Error during getSubscription()', err);
		      });
		  });
		}

		
		// Push Notification Enabler
		$scope.pushButton = function() {
			if (isPushEnabled) {
			  unsubscribe();
			} else {
			  subscribe();
			}
		};

		// // Push Notification Test (Delete this code later)
		// $scope.pushNotificationTest = function() {
		// 	socket.emit('testPushNotifications');
		// };

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

