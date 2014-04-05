angular.module('starter.services', [])

.factory('Chats', function() {

  var chats = [
    { id: 0, name: 'Hiking' },
    { id: 1, name: 'Running' }
  ];

  return {
    all: function() {
      return chats;
    },
    get: function(aChatId) {
      return chats[aChatId];
    }
  }
})

.factory('Friends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var friends = [
    { id: 0, name: 'Scruff McGruff' },
    { id: 1, name: 'G.I. Joe' },
    { id: 2, name: 'Miss Frizzle' },
    { id: 3, name: 'Ash Ketchum' }
  ];

  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      // Simple index lookup
      return friends[friendId];
    }
  }
});
