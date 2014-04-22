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
    getEvents: function(aUsername, aIsFirebaseObj) {
      return aIsFirebaseObj ? ref.child('events/' + aUsername) : eventsRef.$child(aUsername);
    },
    getUsers: function(aIsFirebaseObj) {
      return aIsFirebaseObj ? ref.child('users') : usersRef;
    },
    addChat: function(aUsername, aChatObj) {
      var realMemebers = {};
      realMemebers[aUsername] = 'admin';

      var usersRef = this.getUsers(true);
        angular.forEach(aChatObj.members, function(aMember) {
          var member = aMember.trim();
          usersRef.child(member).once('value', function(aSnapshot) {
          var exists = (aSnapshot.val() !== null);
          if (exists) {
            realMemebers[member] = 'member';
          }
        });
      });
      aChatObj.members = realMemebers;

      var chatUserRef = this.getChats(aUsername);
      var that = this;
      chatUserRef.$add(aChatObj).then(function(aRef) {
        angular.forEach(realMemebers, function(aValue, aMember) {
          if (aMember != aUsername) {
            that.getChats(aMember).$child(aRef.name()).$set(aChatObj);
          }
        });
      });
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
    sendMessageToChat: function(aUsername, aChatId, aMessageObj) {
      var that = this;
      this.getChats(aUsername).$child(aChatId + '/messages').$add(aMessageObj).then(function(aRef) {
        that.getMembersInChat(aUsername, aChatId, function(aMemberObj) {
          angular.forEach(aMemberObj, function(aValue, aMember) {
            if (aUsername != aMember) {
              that.getChats(aMember).$child(aChatId + '/messages/' + aRef.name()).$set(aMessageObj);
            }
          });
        });
      });
    },
    addEvent: function(aUsername, aChatId, aEventObj) {
      var that = this;
      this.getEvents(aUsername).$add(aEventObj).then(function(aRef) {
        var eventId = aRef.name();
        that.getMembersInChat(aUsername, aChatId, function(aMemberObj) {
          // add the event to all the users in the same chat room
          angular.forEach(aMemberObj, function(aValue, aMember) {
            if (aUsername != aMember) {
              that.getEvents(aMember).$child(eventId).$set(aEventObj);
            }
            that.getChats(aMember).$child(aChatId + '/events/' + eventId).$set(aEventObj);
          });
        });      
      });
    },
    joinEvent: function(aUsername, aChatId, aEventId, aJoin) {
      var that = this;
      var joinerObj = {};
      joinerObj[aUsername] = aJoin;

      this.getMembersInChat(aUsername, aChatId, function(aMemberObj) {
        angular.forEach(aMemberObj, function(aValue, aMember) {
          that.getChats(aMember).$child(aChatId + '/events/' + aEventId + "/joiners").$update(joinerObj);
          that.getEvents(aMember).$child(aEventId + "/joiners").$update(joinerObj);
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
