'use strict';
 
angular.module('myApp.dashboard', ['ngRoute'])
// Home controller
.controller('DashboardCtrl', ["$scope", "$firebaseArray", "Auth", "CurrentUserRef", "socket", 
    function($scope, $firebaseArray, Auth, CurrentUserRef, socket) {
        var modulesRef = CurrentUserRef.child('modules');
        $scope.modules = $firebaseArray(modulesRef);
        $scope.isLive = false;
        $scope.liveurl = "";
        var drawables = {};//create a new drawables object
        var display = document.getElementById('videoDisplay').getContext('2d');
        angular.element
        drawables.image_arr = [];
        drawables.buf_size = 0;//hold the number of ready-to-display images
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
//             $scope.liveurl = streamData.url;
//             socket.emit('deleteImage', {
//                 uid: Auth.$getAuth.uid,
//                 data: streamData
//             });
         if(streamData.image) {
           var img = new Image();
           img.src = 'data:image/jpeg;base64,' + streamData.buffer;
           img.addEventListener('load', function() {
             drawables.buf_size += 1;//increment buffer
           });
           img.addEventListener('error', function() {
             console.log("there was an error downloading the image");
           });
           drawables.image_arr.push(img);//cache the image 
         }
        });
        (function displayLoop() {//start the refresh loop
           console.log("checking the buffer for images");
           if(drawables.buf_size >= 1) {
             display.clearRect(0, 0, display.canvas.width, display.canvas.height);
             display.save();
             display.drawImage(drawables.image_arr[0], 0, 0);
             drawables.buf_size -= 1;
             drawables.image_arr.splice(0,1);//remove the image shown
           }
           var nxt_loop = function() {
             displayLoop();
           };
           var timeoutPromise = setTimeout(nxt_loop, 1000/5);//set this loop according to the number of frames per second

          $scope.$on('$destroy',function(){
              clearTimeout(timeoutPromise);
          });
       })();

        /* Use this for logs
        // create a query for the most recent 25 messages on the server
        var query = messagesRef.orderByChild("timestamp").limitToLast(25);
        // the $firebaseArray service properly handles database queries as well
        $scope.filteredMessages = $firebaseArray(query);
        */
    }
]);
