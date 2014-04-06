angular.module('starter.controllers', [])

.controller('ChatsCtrl', function($scope, $location, ChatService) {
  $scope.chats = ChatService.all();

  $scope.showSettings = function() {
    $location.url('/settings');
  }
})

.controller('ChatCtrl', function($scope, $stateParams, ChatService) {
  $scope.chat = ChatService.get($stateParams.chatId);

  var tabs = document.querySelectorAll('div.tabs')[0];
  tabs = angular.element(tabs);
  tabs.css('display', 'none');
  
  $scope.$on('$destroy', function() {
    tabs.css('display', '');
  });
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
