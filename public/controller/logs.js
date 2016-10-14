'use strict';
 
angular.module('myApp.logs', ['ngRoute'])
// Home controller
.controller('LogsCtrl', ["$scope", "$firebaseArray", "CurrentUserRef", 
	function($scope, $firebaseArray, CurrentUserRef) {
	    $scope.modulesRef = CurrentUserRef.child('modules');
	    $scope.modules = $firebaseArray($scope.modulesRef);
	    $scope.logLimit = 25;
	    $scope.currentModuleLogs = [];


		$scope.currentModuleLabel = "-";
	    $scope.changeModule = function(module) {
	    	if (module) {
	    		// Change the current module label.
	    		$scope.currentModuleLabel = module.label;
	    		// Get the logs
	    		var query = $scope.modulesRef.child(module.$id + "/logs").orderByChild("timestamp").limitToLast($scope.logLimit);
	    		$scope.currentModuleLogs = $firebaseArray(query);
	    	} else {
	    		$scope.currentModuleLabel = "-";
	    	}
	    }

	    $scope.millisecondsToDate = function(milliseconds) {
	    	var date = new Date(milliseconds);
			return date.toLocaleDateString() + " @ " + date.toLocaleTimeString();
	    }

	    /* Use this for logs
	    // create a query for the most recent 25 messages on the server
	    var query = messagesRef.orderByChild("timestamp").limitToLast(25);
	    // the $firebaseArray service properly handles database queries as well
	    $scope.filteredMessages = $firebaseArray(query);
	    */
	}
]);


/*
Users need to log into their USES account on their Pi.
The USES information is sent to node js.
Node server logs into the USES account to get User.UID. 
Set up the current socket user into a namespace with name = User.UID
With that, we can have direct communication between sockets.
*/