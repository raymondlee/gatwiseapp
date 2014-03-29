var gatwise = {
    alertDismissed: function() {
            // do something            
            console.log('hello');
    },

    // Show a custom alertDismissed
    //
    
    showAlert: function(){
        navigator.notification.alert(
            'You are the winner!',  // message
            this.alertDismissed,         // callback
            'Game Over',            // title
            'Done'                  // buttonName
        );
    }
};