'use strict';
 
angular.module('myApp.addModule', ['ngRoute'])
// Home controller
.controller('AddModuleCtrl', ["$scope", "$interval", "socket", function($scope, $interval, socket) {
	var firebaseObj = firebase.database().ref();
	$scope.bluetoothDevices = [];
	$scope.currentModule = "";

	var intervalPromise = $interval(function() {
		console.log("Fetching bluetooth");
		socket.emit('receiveBluetoothDevices', {});
	}, 5000);

	socket.on('receiveBluetoothDevices', function(data) {
		console.log("Received bluetooth: " + data);
		$scope.bluetoothDevices = data;
	});

	$scope.addNewModule = function(moduleToAdd) {
		if (moduleToAdd) socket.emit('addBluetoothDevice', moduleToAdd);
	};

	$scope.$on('$destroy',function(){
	    if(intervalPromise) $interval.cancel(intervalPromise);   
	});
}]);