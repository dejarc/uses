'use strict';
 
angular.module('myApp.sidebar', ['ngRoute'])
// Home controller
.controller('SidebarCtrl', ["$scope", "$location", "Auth", "CurrentUserRef", function($scope, $location, Auth, CurrentUserRef) {
    var profileRef = CurrentUserRef.child('profile');
    profileRef.once('value').then(function(snapshot) {
        var firstname = snapshot.val().firstname;
        var lastname = snapshot.val().lastname;
        if (firstname && lastname) {
            $scope.username = firstname + " " + lastname;
        } else {
            $scope.username = "User Settings";
        }
    });

    $scope.isActiveMenu = function(path) {
        return  path == $location.$$path;
    }

    $scope.signOut = function() {
        Auth.$signOut();
    }
}]);

// $("#menu-toggle").click(function(e) {
//         e.preventDefault();
//         $("#wrapper").toggleClass("toggled");
//     });
//      $("#menu-toggle-2").click(function(e) {
//         e.preventDefault();
//         $("#wrapper").toggleClass("toggled-2");
//         $('#menu ul').hide();
//     });
 
//      function initMenu() {
//       $('#menu ul').hide();
//       $('#menu ul').children('.current').parent().show();
//       //$('#menu ul:first').show();
//       $('#menu li a').click(
//         function() {
//           var checkElement = $(this).next();
//           if((checkElement.is('ul')) && (checkElement.is(':visible'))) {
//             return false;
//             }
//           if((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
//             $('#menu ul:visible').slideUp('normal');
//             checkElement.slideDown('normal');
//             return false;
//             }
//           }
//         );
//       }
//     $(document).ready(function() {initMenu();});