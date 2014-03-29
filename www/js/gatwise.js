var gatwise = {
    alertDismissed: function() {
        console.error('hello');
    },

   showAlert: function() {
        navigator.notification.alert(
            'You are the winner!',  // message
            this.alertDismissed,    // callback
            'Game Over',            // title
            'Done'                  // buttonName
        );
    },
    
    getContacts: function() {
        var options = new ContactFindOptions();
        options.filter = '';
        options.multiple = true;
        var fields = ['*'];  //"*" will return all contact fields
        navigator.contacts.find(fields, this.getContactsSuccess, this.onError, options);
    },
    
    getContactsSuccess: function(aContacts) {
        var li = '';

        $.each(aContacts, function(aContactKey, aContact) {
            var name, phone;
            if (aContact.name) {
                $.each(aContact.name, function(aNameKey, aName) {
                    if (aNameKey == 'formatted') {
                        name = aName;
                    }
                });
            }
            if (aContact.phoneNumbers) {
                $.each(aContact.phoneNumbers, function(aPhoneNumberKey, aPhoneNumber) {
                    phone = aPhoneNumber.value;
                });
            }
            if (name) {
                li += '<li style="text-decoration:none;">' + name;
                if (phone) {
                    li += ' ' + phone;
                }
                li += '</li>';
            } 
        });
        $("#contacts").html(li);
    },
    
    getContactsError: function(aError) {
        alert('onError!');
    }
};