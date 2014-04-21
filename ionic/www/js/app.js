// Ionic Starter App, v0.9.20

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('gatwise', ['ionic', 'firebase', 'ngStorage', 'gatwise.controllers', 'gatwise.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    StatusBar.styleDefault();
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    .state('register', {
      url: "/register",
      templateUrl: 'templates/register.html',
      controller: 'RegisterCtrl'
    })

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:
    .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat', {
      url: '/chat/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat.html',
          controller: 'ChatCtrl'
        }
      }
    })
    .state('createChat', {
      url: '/create-chat',
      templateUrl: 'templates/create-chat.html',
      controller: 'CreateChatCtrl'
    })

    .state('tab.events', {
      url: '/events',
      views: {
        'tab-events': {
          templateUrl: 'templates/tab-events.html',
          controller: 'EventsCtrl'
        }
      }
    })

    .state('settings', {
      url: "/settings",
      templateUrl: 'templates/settings.html',
      controller: 'SettingsCtrl'
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/register');

})

.directive('googleplace', function() {
  return {
    require: 'ngModel',
    link: function($scope, aElement, aAttrs, aModel) {
      var options = {
        types: [],
        componentRestrictions: {}
      };
      $scope.gPlace = new google.maps.places.Autocomplete(aElement[0], options);
 
      google.maps.event.addListener($scope.gPlace, 'place_changed', function() {
        $scope.$apply(function() {
          aModel.$setViewValue(aElement.val());
          var place = $scope.gPlace.getPlace();
          console.log(place.geometry.location.lat() + "," + place.geometry.location.lat())
        });
      });
    }
  };
});


