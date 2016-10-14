'use strict';
 
angular.module('myApp.dashboard', ['ngRoute'])
// Home controller
.controller('DashboardCtrl', ["$scope", "$firebaseArray", "CurrentUserRef", 
    function($scope, $firebaseArray, CurrentUserRef) {
        var modulesRef = CurrentUserRef.child('modules');
        $scope.modules = $firebaseArray(modulesRef);

        /* Use this for logs
        // create a query for the most recent 25 messages on the server
        var query = messagesRef.orderByChild("timestamp").limitToLast(25);
        // the $firebaseArray service properly handles database queries as well
        $scope.filteredMessages = $firebaseArray(query);
        */
    }
]);