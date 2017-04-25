// `chrome.storage.sync()` utlity class
// TODO: Add array storage (for things like parsed URLs, msgIDs, settings, ignores)
// http://stackoverflow.com/questions/15717334/chrome-sync-storage-to-store-and-update-array

/* Usage
// Create new session
thisSession = new Session({
	someSyncedProperty: false
})

// Invert a session property's value
thisSession.set('someSyncedProperty', !thisSession.someSyncedProperty);

// Listen for session property changes
thisSession.onChange({
    someSyncedProperty: function(newValue) {
		// Access a session property
		console.log(newValue == thisSession.someSyncedProperty) => true
	},
});
*/

// Use when you need to nuke, during testing
// chrome.storage.sync.clear()

var Session = function(sessionProperties) {
    var Session = this

    Session.callbacks = {}

    /* ----
        Class methods
    */

    Session.set = function(property,value,cb) {
        var Session = this
        Session[property] = value

        var keyValue = {}
        keyValue[property] = value

        chrome.storage.sync.set(
            keyValue,
            function sentToStorage() {
                console.log("SET Session."+property+" = ",value)
                if(typeof Session.callbacks[property] === 'function') Session.callbacks[property](value,"set")
                if(typeof cb === 'function') cb(value)
            }
        )
        return Session[property]
    }

	Session.add = function(property,newValue,cb) {
        var Session = this;
		var updatedArray = Session[property];
		updatedArray.push(newValue);
		Session.set(property, updatedArray, cb);
	}

    Session.get = function(property,cb) {
        var Session = this
        chrome.storage.sync.get(property, function receivedPropertyFromStorage(requestedStorage) {
            console.log("GET Session."+property+" = ",requestedStorage[property])
            Session[property] = requestedStorage[property]
            if(typeof Session.callbacks[property] === 'function') Session.callbacks[property](Session[property],"get") // on init
            if(typeof cb === 'function') cb(Session[property])
        })
    }

	Session.init = function(property,defaultValue,cb) {
        var Session = this;
		Session.get(property, function(storageValue) {
			if(storageValue != undefined) {
				console.log("Synced "+property+" with server: ",storageValue)
			} else {
				console.log("Resetting "+property+" to ",defaultValue)
				Session.set(property,defaultValue,cb);
			}
		})
	}

    Session.onChange = function(callbackObj) {
        var Session = this
		Object.assign(Session.callbacks, callbackObj)
    }

    /* ----
        Constructor
    */

	console.log("--- Loading chrome sync")
	for (var property in sessionProperties) {
		if(sessionProperties.hasOwnProperty(property) ) {
			console.log("--- syncing "+property)
	        Session.init(property, sessionProperties[property]);
		}
	}
}
