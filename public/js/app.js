angular.module('uses',['ngRoute'])
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl:'templates/about-uses.html'/*,
        controller:'ListController',
        resolve: {
            conversations: function(Conversations) {
              var conv = Conversations.getConversations();
              return conv;
            }
        }*/
      })
      .when('/myAccount', {
        templateUrl:'templates/about-uses.html'/*,
        controller:'AccountController',
        resolve: {
            conversations: function(Conversations) {
              var conv = Conversations.getConversations();
              return conv;
            }
        }*/
      })
      .when('/createAccount', {
        templateUrl:'templates/about-uses.html'/*,
        controller:'CreateAccountController',
        resolve: {
            conversations: function(Conversations) {
              var conv = Conversations.getConversations();
              return conv;
            }
        }*/
      })
      .otherwise({
        redirectTo: "/"
      })
  })
  .controller('HeaderController',function($window,$scope) {
    this.tab = 2;
    $window.document.title = 'About U.S.E.S.';
    this.tab_route_vals = {};//store the title and tab values for basic routes
    this.tab_route_vals['/myAccount'] = {tab: 1, doc_title: "My Account"};
    this.tab_route_vals['/'] = {tab: 2, doc_title: "About U.S.E.S."};
    this.tab_route_vals['/createAccount'] = {tab: 3, doc_title: "Create Account"};
    var that = this;
    $scope.$on('$routeChangeSuccess',function(event,current,previous) {
      var route_path = current['$$route']['originalPath'];
      if(that.tab_route_vals[route_path]) {
        that.tab = that.tab_route_vals[route_path].tab;//after location change, change tab
        $window.document.title = that.tab_route_vals[route_path].doc_title;//change title
      }
    });
    this.isSelected = function(myTab) {
      return this.tab === myTab;
    };
  });
