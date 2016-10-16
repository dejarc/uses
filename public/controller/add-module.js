'use strict';
 
angular.module('myApp.addModule', ['ngRoute'])
// Home controller
.controller('AddModuleCtrl', ["$scope", "$interval", "socket", function($scope, $interval, socket) {
	var firebaseObj = firebase.database().ref();
	$scope.bluetoothDevices = [];
	$scope.currentModule = "";

	$scope.refreshNewModules = function() {
		console.log("Fetching bluetooth");
		socket.emit('receiveBluetoothDevices', {});
	};

	$scope.refreshNewModules();

	socket.on('receiveBluetoothDevices', function(data) {
		console.log("Received bluetooth: " + data);
		$scope.bluetoothDevices = data;
	});

	$scope.addNewModule = function(moduleToAdd) {
		if (moduleToAdd) socket.emit('addBluetoothDevice', moduleToAdd);
	};

}]);