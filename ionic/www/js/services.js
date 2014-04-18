angular.module('gatwise.services', [])

.factory('FirebaseService', function($firebase) {
    var ref = new Firebase("https://gatwise.firebaseio.com/");
    return {
      getRoot: function() {
        return $firebase(ref);
      }      
    }
})

.factory('ChatService', function() {

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
})

.factory("ContactService", function ($rootScope, $q) {
  return {
    create: function () {
      return navigator.contacts.create()
    },
    find: function (aFilter) {
      var deferred = $q.defer();
      var options = new ContactFindOptions();
      options.filter = aFilter;
      options.multiple = true;

      navigator.contacts.find(["displayName"], function (aContacts) {
        $rootScope.$apply(function () {
          deferred.resolve(aContacts);
         });
        }, function (aError) {
          $rootScope.$apply(function () {
          deferred.reject(aError);
        });
      }, options);

      return deferred.promise;
    }
  };
});
