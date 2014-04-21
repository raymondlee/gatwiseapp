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
    },
    getMembersInChat: function(aUsername, aChatId, aCallback) {
      var ref = this.getChats(aUsername).$child(aChatId + '/members');
      ref.$on('loaded', function() {
        var keys = ref.$getIndex();
        var members = {};
        keys.forEach(function(aKey, aIndex) {
          members[aKey] = ref[aKey];
        });
        aCallback(members);
      });
    },
    setMessageForChat: function(aUsername, aChatId, aMessageObj) {
      var that = this;
      this.getMembersInChat(aUsername, aChatId, function(aMemberObj) {
        angular.forEach(aMemberObj, function(aValue, aMemberKey) {
          if (aUsername != aMemberKey) {
            that.getChats(aMemberKey).$child(aChatId + '/messages').$add(aMessageObj);
          }
        });
      });
    },
    addEvent: function(aUsername, aChatId, aEventRef, aEventObj) {
      
      // add event to the current user
      this.getChats(aUsername).$child(aChatId).$child('events/' + aEventRef).$set(aEventObj);  

      // then add the event to all the users in the same chat room
      var that = this;
      this.getMembersInChat(aUsername, aChatId, function(aMemberObj) {
        angular.forEach(aMemberObj, function(aValue, aMemberKey) {
          if (aUsername != aMemberKey) {
            that.getChats(aMemberKey).$child(aChatId + '/events/' + aEventRef).$set(aEventObj);
          }
        });
      });      
    }
  };
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
