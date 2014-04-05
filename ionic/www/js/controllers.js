angular.module('starter.controllers', [])

.controller('ChatsCtrl', function($scope, $location, Chats) {
  $scope.chats = Chats.all();

  $scope.showSettings = function() {
    $location.url('/settings');
  }
})

.controller('ChatCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);

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

.controller('SettingsCtrl', function($scope, $location) {
  $scope.save = function() {
    $location.url('/tab/chats');
  }
  $scope.cancel = function() {
    $location.url('/tab/chats');
  }
});
