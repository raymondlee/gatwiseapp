var gatwise = {
    alertDismissed: function() {
            // do something            
            console.log('hello');
    },

   showAlert: function(){
        navigator.notification.alert(
            'You are the winner!',  // message
            this.alertDismissed,         // callback
            'Game Over',            // title
            'Done'                  // buttonName
        );
    },
    
    getContacts: function() {
        // find all contacts with 'Bob' in any name field
        var options = new ContactFindOptions();
        //options.filter = "Bob";
        var fields = ["displayName"];
        navigator.contacts.find(fields, this.getContactsSuccess, this.onError, options);
    },
    
    getContactsSuccess: function(aContacts) {
        for (var i = 0; i < aContacts.length; i++) {
          console.log("Display Name = " + aContacts[i].displayName);
        }
    },
    
    getContactsError: function(aError) {
       alert('onError!');
    }
};