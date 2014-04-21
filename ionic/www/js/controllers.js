angular.module('gatwise.controllers', [])

.controller('ChatsCtrl', function($scope, $location, ChatService) {
  $scope.chats = ChatService.all();

  $scope.showSettings = function() {
    $location.url('/settings');
  }
})

.controller('ChatCtrl', function($rootScope, $scope, $ionicModal, $stateParams, ChatService, FirebaseService) {
  $scope.chat = ChatService.get($stateParams.chatId);

  var tabs = document.querySelectorAll('div.tabs')[0];
  tabs = angular.element(tabs);
  tabs.css('display', 'none');

  $scope.chatroom = FirebaseService.getChats().$child($rootScope.username + '/' + $stateParams.chatId);
  $scope.messages =  $scope.chatroom.$child('messages');
  $scope.events = FirebaseService.getEvents();
  $scope.username = "Hi ";

  $scope.addMessage = function(e) {
    if (e && e.keyCode != 13) return;
    $scope.messages.$add({
      username: $scope.username,
      message: $scope.chat.newMessage
    }).then(function(aRef) {
      console.log(aRef.name());
    });
    $scope.chat.newMessage = "";
  };

  $scope.$on('$destroy', function() {
    tabs.css('display', '');
  });

  // modal view for creating events
  $ionicModal.fromTemplateUrl('templates/create-event.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(aModal) {
    $scope.createEventModal = aModal;    
  });

  $scope.addEvent = function() {
    $scope.createEventModal.show();
  };

  $scope.submitEvent = function() {
    $scope.createEventModal.hide();
    $scope.events.$add({
      name: $scope.chat.event.name,
      when: $scope.chat.event.when,
      where: $scope.chat.event.where,
      chatId: $stateParams.chatId
    }).then(function(aRef) {
      $scope.chatroom.$child('events/' + aRef.name()).$set(true);
      // FirebaseService.getUsers().$child($rootScope.username + '/events/' + aRef.name()).$set(true);
    });
    $scope.createEventModal.remove();
  };
})

.controller('EventsCtrl', function($rootScope, $scope, FirebaseService) {
  var eventsRef = FirebaseService.getUsers().$child($rootScope.username + '/events');
  eventsRef.$on('loaded', function(aEvents) {
    $scope.events = [];

    angular.forEach(aEvents,function(aEventValue, aEventId) {
      var eventRef = FirebaseService.getEvents().$child(aEventId);
      $scope.events.push(eventRef);
    });
  });
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('SettingsCtrl', function($scope, $location, $ionicModal, ContactService) {
  $scope.save = function() {
    $location.url('/tab/chats');
  }
  $scope.cancel = function() {
    $location.url('/tab/chats');
  }

  // Set map location
  var mapOptions = {
    center: new google.maps.LatLng(43.07493,-89.381388),
    zoom: 16,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  // Stop the side bar from dragging when mousedown/tapdown on the map
  google.maps.event.addDomListener(document.getElementById('map-canvas'), 'mousedown', function(e) {
    e.preventDefault();
    return false;
  });
  $scope.map = map;

  navigator.geolocation.getCurrentPosition(function(aPos) {
    $scope.map.setCenter(
      new google.maps.LatLng(aPos.coords.latitude, aPos.coords.longitude));
  }, function(error) {
    alert('Unable to get location: ' + error.message);
  });

  // modal view
  $ionicModal.fromTemplateUrl('templates/modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(aModal) {
    $scope.modal = aModal;
    ContactService.find('').then(function (aContacts) {
      $scope.contacts = aContacts;
    }, function (aError) {
      console.log(aError);
    });
  });

  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
})

.controller('RegisterCtrl', function($rootScope, $scope, $firebase, $location, $localStorage, FirebaseService) {
  $scope.$storage = $localStorage;
  if ($scope.$storage.username) {
    console.log("Has local username " + $scope.$storage.username);
    $rootScope.username = $scope.$storage.username;
    $location.url("/tab/chats");
  }

  $scope.register = function() {
    var usersRef = FirebaseService.getUsers(true);
    usersRef.child($scope.register.username).once('value', function(aSnapshot) {
      var exists = (aSnapshot.val() !== null);
      if (!exists) {
        var uuid = "test";
        /*
        if (device) {
          uuid = device.uuid
        } else {
          uuid = "test";
        }
        */
        console.log("Has no server username and creating... " + $scope.register.username)
        $firebase(usersRef).$child($scope.register.username + "/" + uuid).$set(true);
      } else {
        console.log("Has server username " + $scope.register.username)
      }
      $scope.$storage.username = $scope.register.username;
      $rootScope.username = $scope.$storage.username;
      $location.url("/tab/chats");
    });
  }  
});