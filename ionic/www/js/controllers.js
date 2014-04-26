angular.module('gatwise.controllers', [])

.controller('ChatsCtrl', function($rootScope, $scope, $location, FirebaseService) {
  $scope.chats = FirebaseService.getChats($rootScope.username);
  $scope.chats.$on('loaded', function() {
    var chatKeys = $scope.chats.$getIndex();
    chatKeys.forEach(function(aKey, aIndex) {
      $scope.chats[aKey].id = aKey;
    });
  });

  $scope.showCreateChat = function() {
    $location.url('/create-chat');
  };

  $scope.showSettings = function() {
    $location.url('/settings');
  };
})

.controller('ChatCtrl', function($rootScope, $scope, $stateParams, $ionicModal, FirebaseService) {
  var tabs = document.querySelectorAll('div.tabs')[0];
  tabs = angular.element(tabs);
  tabs.css('display', 'none');
  
  $scope.username = $rootScope.username;
  $scope.chatroom = FirebaseService.getChats($rootScope.username).$child($stateParams.chatId);
  $scope.messages =  $scope.chatroom.$child('messages');
  $scope.events = $scope.chatroom.$child('events');

  var updateEvents = function() {
    var eventKeys = $scope.events.$getIndex();
    eventKeys.forEach(function(aKey, aIndex) {
      $scope.events[aKey].id = aKey;
      var join = false;
      if ('joiners' in $scope.events[aKey]) {
        if ($rootScope.username in $scope.events[aKey].joiners) {
          join = $scope.events[aKey].joiners[$rootScope.username];
        }
      }
      $scope.events[aKey].join = join;
    });
  };
  $scope.events.$on('loaded', updateEvents);
  // XXX: when something changes within events, the custom data appended by us get lost.
  $scope.events.$on('change', updateEvents);

  $scope.toggleJoinEvent = function(aEventId) {
    var join = $scope.events[aEventId].join;
    FirebaseService.joinEvent($rootScope.username, $stateParams.chatId, aEventId, join);
  };

  $scope.addMessage = function(e) {
    if (e && e.keyCode != 13) return;
    var messageObj = {
      username: $scope.username,
      message: $scope.chatroom.newMessage
    };
    FirebaseService.sendMessageToChat($rootScope.username, $stateParams.chatId, messageObj);
    $scope.chatroom.newMessage = "";
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

  
  // keep track of the where, when options
  var whereIndex = 0;
  var whenIndex = 0;

  $scope.showEventModal = function() {
    $scope.whereOptions = [{id: whereIndex}];
    $scope.whenOptions = [{id: whenIndex}];
    $scope.createEventModal.show();
  };
  $scope.closeEventModal = function() {
    $scope.createEventModal.remove();
    // rest fields
    $scope.chatroom.event.name = '';
    whereIndex = 0;
    whenIndex = 0;
    $scope.whereOptions = [{id: whereIndex}];
    $scope.whenOptions = [{id: whenIndex}];
  };
  $scope.addWhere = function() {
    whereIndex++;
    $scope.whereOptions.push({id: whereIndex});
  };
  $scope.addWhen = function() {
    whenIndex++;
    $scope.whenOptions.push({id: whenIndex});
  };
  $scope.submitEvent = function() {
    $scope.createEventModal.hide();
    $scope.events = FirebaseService.getEvents($rootScope.username);

    var eventObj = {
      name: $scope.chatroom.event.name,
      when: $scope.chatroom.event.when,
      where: $scope.chatroom.event.where,
      chatId: $stateParams.chatId
    };
    FirebaseService.addEvent($rootScope.username, $stateParams.chatId, eventObj);

    $scope.closeEventModal();
  };  
})

.controller('CreateChatCtrl', function($rootScope, $scope, $location, FirebaseService) {
  $scope.chat = {};
  $scope.createChat = function() {
    var members = $scope.chat.members.split(',');
    var chatObj = {
      name: $scope.chat.name,
      members: members
    };
    FirebaseService.addChat($rootScope.username, chatObj);
    $location.url('/tab/chats');
  };
  $scope.closeCreateChat = function() {
    $location.url('/tab/chats');
  };
})

.controller('EventsCtrl', function($rootScope, $scope, FirebaseService) {
  $scope.events = FirebaseService.getEvents($rootScope.username);
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