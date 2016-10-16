'use strict';
 var chartData = [];
  
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
	    		$scope.currentModuleLogs = [];
	    	}
			
			if(module){
				$scope.modulesRef.child(module.$id + "/logs").orderByChild("timestamp").limitToLast($scope.logLimit).once('value', function(snaps) { 
					snaps.forEach(function(log){
						var date = new Date(log.val().timestamp);
						//console.log(date.toLocaleDateString() + " " + log.val().value);
						var string = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
						chartData.push({time: string, value: log.val().value});
					});
					document.getElementById('line-chart').innerHTML = "";
					drawGraph();
					chartData = [];
				});
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

// Draws a line graph in the given element id
function drawGraph() {
	new Morris.Line({
	  // ID of the element in which to draw the chart.
	  element: 'line-chart',
	  // Chart data records -- each entry in this array corresponds to a point on
	  // the chart.
	  data: chartData,
	  // The name of the data record attribute that contains x-values.
	  xkey: 'time',
	  // A list of names of data record attributes that contain y-values.
	  ykeys: ['value'],
	  // Labels for the ykeys -- will be displayed when you hover over the
	  // chart.
	  labels: ['Value']
	});
}

/*
Users need to log into their USES account on their Pi.
The USES information is sent to node js.
Node server logs into the USES account to get User.UID. 
Set up the current socket user into a namespace with name = User.UID
With that, we can have direct communication between sockets.
*/