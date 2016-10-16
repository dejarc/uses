'use strict';
 
angular.module('myApp.addModule', ['ngRoute'])
// Home controller
.controller('AddModuleCtrl', ["$scope", "$interval", "socket", function($scope, $interval, socket) {
	var firebaseObj = firebase.database().ref();
	$scope.bluetoothDevices = [];
	$scope.currentModule = "";

	$scope.i = 0;
	var intervalPromise = $interval(function() {
		if ($scope.i > 3) { 
			console.log("Fetching bluetooth");
			socket.emit('receiveBluetoothDevices');
		}
		$scope.i = $scope.i + 1;
	}, 1000);

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