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
		$scope.currentTime = '';

		$scope.currentModuleLabel = "-";
	    $scope.changeModule = function(module) {
	    	if (module) {
	    		// Change the current module label.
	    		$scope.currentModuleLabel = module.label;
	    		// Get the logs
	    		var query = $scope.modulesRef.child(module.$id + "/logs").orderByChild('-timestamp');
	    		$scope.currentModuleLogs = $firebaseArray(query);
	    		$("#graph-container").show();
	    	} else {
	    		$scope.currentModuleLabel = "-";
	    		$scope.currentModuleLogs = [];
	    		$("#graph-container").hide();
	    	}
			
			if(module){
				var ymin = Number.POSITIVE_INFINITY;
				var ymax = Number.NEGATIVE_INFINITY;
				$scope.modulesRef.child(module.$id + "/logs").orderByChild("timestamp").limitToLast($scope.logLimit).once('value', function(snaps) { 
					snaps.forEach(function(log){
						var date = new Date(log.val().timestamp);
						//console.log(date.toLocaleDateString() + " " + log.val().value);
						var string = buildMorrisTimeString(date);
						var theValue = Math.round(log.val().value);
						if(theValue < ymin) {
							ymin = theValue;
						}
						if(theValue > ymax) {
							ymax = theValue;
						}
						chartData.push({time: string, value: log.val().value.toFixed(2)});
					});
					document.getElementById('line-chart').innerHTML = "";
					drawGraph(module.unit, ymin-1, ymax+1);
					chartData = [];
					//Update time of latest data.
					$scope.currentTime = new Date().toLocaleString();		
				});
				window.setInterval(function() {
				var ymin = Number.POSITIVE_INFINITY;
				var ymax = Number.NEGATIVE_INFINITY;
				$scope.modulesRef.child(module.$id + "/logs").orderByChild("timestamp").limitToLast($scope.logLimit).once('value', function(snaps) { 
					snaps.forEach(function(log){
						var date = new Date(log.val().timestamp);
						//console.log(date.toLocaleDateString() + " " + log.val().value);
						var string = buildMorrisTimeString(date);
						var theValue = Math.round(log.val().value);
						if(theValue < ymin) {
							ymin = theValue;
						}
						if(theValue > ymax) {
							ymax = theValue;
						}
						chartData.push({time: string, value: log.val().value.toFixed(2)});
					});
					document.getElementById('line-chart').innerHTML = "";
					drawGraph(module.unit, ymin-1, ymax+1);
					chartData = [];
					//Update time of latest data.
					$scope.currentTime = new Date().toLocaleString();		
				});
				}, 1000);
			}
	    }

	    $scope.millisecondsToDate = function(milliseconds) {
	    	var date = new Date(milliseconds);
	    	return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear().toString().substr(2,2) + " @ " + date.toLocaleTimeString();;
			// return date.toLocaleDateString() + " @ " + date.toLocaleTimeString();
	    }

	    /* Use this for logs
	    // create a query for the most recent 25 messages on the server
	    var query = messagesRef.orderByChild("timestamp").limitToLast(25);
	    // the $firebaseArray service properly handles database queries as well
	    $scope.filteredMessages = $firebaseArray(query);
	    */
	}
	
	
]);

// Builds a time string for morris.js to draw a graph line with
function buildMorrisTimeString(date) {
	// Add YYYY-MM-DD
	var dateString = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " ";
	// prepend 0 if single digit hours
	if (date.getHours() > 9) {
		dateString += date.getHours() + ":";
	} else {
		dateString += "0" + date.getHours() + ":";
	}
	// prepend 0 if single digit minutes
	if (date.getMinutes() > 9) {
		dateString += date.getMinutes() + ":";
	} else {
		dateString += "0" + date.getMinutes() + ":";
	}
	// prepent 0 if single digit seconds
	if (date.getSeconds() > 9) {
		dateString += date.getSeconds();
	} else {
		dateString += "0" + date.getSeconds();
	}
	return dateString;
}

// Draws a line graph in the given element id
function drawGraph(unit, minY, maxY) {
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
	  ymin: minY,
	  ymax: maxY,
	  labels: [unit],
	  resize: 'true'
	});
}

/*
Users need to log into their USES account on their Pi.
The USES information is sent to node js.
Node server logs into the USES account to get User.UID. 
Set up the current socket user into a namespace with name = User.UID
With that, we can have direct communication between sockets.
*/