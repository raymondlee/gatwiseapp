angular.module('gatwise.controllers', [])

.controller('ChatsCtrl', function($scope, $location, ChatService) {
  $scope.chats = ChatService.all();

  $scope.showSettings = function() {
    $location.url('/settings');
  }
})

.controller('ChatCtrl', function($scope, $firebase, $ionicModal, $stateParams, ChatService) {
  $scope.chat = ChatService.get($stateParams.chatId);

  var tabs = document.querySelectorAll('div.tabs')[0];
  tabs = angular.element(tabs);
  tabs.css('display', 'none');
  
  var firebaseMessages = new Firebase("https://gatwise.firebaseio.com/chats/chat" + $stateParams.chatId + "/messages");
  var firebaseEvents = new Firebase("https://gatwise.firebaseio.com/chats/chat" + $stateParams.chatId + "/events");
  $scope.messages = $firebase(firebaseMessages);
  $scope.events = $firebase(firebaseEvents);
  $scope.username = device.uuid;

  $scope.addMessage = function(e) {
    if (e && e.keyCode != 13) return;
    $scope.messages.$add({
      username: $scope.username,
      message: $scope.chat.newMessage});
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
      where: $scope.chat.event.where});
    $scope.createEventModal.remove();
  };
})

.controller('FriendsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
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
});
