'use strict';
 
angular.module('myApp.dashboard', ['ngRoute'])
// Home controller
.controller('DashboardCtrl', ["$scope", "$firebaseArray", "Auth", "CurrentUserRef", "socket", 
    function($scope, $firebaseArray, Auth, CurrentUserRef, socket) {
        var modulesRef = CurrentUserRef.child('modules');
        $scope.modules = $firebaseArray(modulesRef);
        $scope.isLive = false;
        $scope.liveurl = "";

        $scope.toggleLiveStream = function() {
            if ($scope.isLive) {
                socket.emit('stop-stream', {
                    uid: Auth.$getAuth().uid
                });
            } else {
                socket.emit('start-stream', {
                    uid: Auth.$getAuth().uid
                });
            }
            $scope.isLive = !$scope.isLive;
        }

        $scope.pauseLiveStream = function() {
            $scope.isLive =false;
        }

        socket.on('newImage', function(streamData) {
            $scope.liveurl = streamData.url;
            socket.emit('deleteImage', {
                uid: Auth.$getAuth.uid,
                data: streamData
            });
        });

        /* Use this for logs
        // create a query for the most recent 25 messages on the server
        var query = messagesRef.orderByChild("timestamp").limitToLast(25);
        // the $firebaseArray service properly handles database queries as well
        $scope.filteredMessages = $firebaseArray(query);
        */
    }
]);