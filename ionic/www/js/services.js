angular.module('gatwise.services', [])

.factory('FirebaseService', function($firebase) {
    var ref = new Firebase("https://gatwise.firebaseio.com/");
    var firebaseRef = $firebase(ref); 
    var chatsRef = firebaseRef.$child('chats');
    var eventsRef = firebaseRef.$child('events');
    var usersRef = firebaseRef.$child('users');

    return {
      getRoot: function() {
        return firebaseRef;
      },
      getChats: function(aUsername, aIsFirebaseObj) {
        return aIsFirebaseObj ? ref.child('chats/' + aUsername) : chatsRef.$child(aUsername);
      },
      getEvents: function() {
        return eventsRef;
      },
      getUsers: function(aIsFirebaseObj) {
        return aIsFirebaseObj ? ref.child('users') : usersRef;
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
