// `chrome.storage.sync()` utlity class
// TODO: Add array storage (for things like parsed URLs, msgIDs, settings, ignores)
// http://stackoverflow.com/questions/15717334/chrome-sync-storage-to-store-and-update-array

/* Usage
// Create new session
thisChromeStorage = new ChromeStorage({
	someSyncedProperty: false
})

// Invert a session property's value
thisChromeStorage.set('someSyncedProperty', !thisChromeStorage.someSyncedProperty);

// Listen for session property changes
thisChromeStorage.onChange({
    someSyncedProperty: function(newValue) {
		// Access a session property
		console.log(newValue == thisChromeStorage.someSyncedProperty) => true
	},
});
*/

var ChromeStorage = function(sessionProperties, api = "sync", initCb) {
    var ChromeStorage = this

	ChromeStorage.api = api
    ChromeStorage.callbacks = {}
    ChromeStorage.initFuncs = {}

	// Use when you need to nuke, during testing
	// chrome.storage[api].clear()

    /* ----
        Class methods
    */

    ChromeStorage.set = function(property,value,cb) {
        var ChromeStorage = this
        ChromeStorage[property] = value

        var keyValue = {}
        keyValue[property] = value

        chrome.storage[api].set(
            keyValue,
            function sentToStorage() {
                console.log("SET ChromeStorage."+ChromeStorage.api+"."+property+" = ",value)
                if(typeof ChromeStorage.callbacks[property] === 'function') ChromeStorage.callbacks[property](value,"set")
                if(typeof cb === 'function') cb(value)
            }
        )
        return ChromeStorage[property]
    }

	ChromeStorage.add = function(property,newValue,cb) {
        var ChromeStorage = this;
		var updatedArray = ChromeStorage[property];
		updatedArray.push(newValue);
		ChromeStorage.set(property, updatedArray, cb);
	}

    ChromeStorage.get = function(property,cb) {
        var ChromeStorage = this
        chrome.storage[api].get(property, function receivedPropertyFromStorage(requestedStorage) {
            console.log("GET ChromeStorage."+ChromeStorage.api+"."+property+" = ",requestedStorage[property])
            ChromeStorage[property] = requestedStorage[property]
            if(typeof ChromeStorage.initFuncs[property] === 'function') ChromeStorage.initFuncs[property](ChromeStorage[property],"get") // on init
            if(typeof cb === 'function') cb(ChromeStorage[property])
        })
    }

	ChromeStorage.init = function(property,defaultValue,cb) {
        var ChromeStorage = this;
		ChromeStorage.get(property, function(storageValue) {
			if(storageValue != undefined) {
				console.log("Synced "+property+" with server: ",storageValue)
			} else {
				console.log("Resetting "+property+" to ",defaultValue)
				ChromeStorage.set(property,defaultValue);
			}
		})
	}

    ChromeStorage.onChange = function(callbackObj) {
        var ChromeStorage = this
		Object.assign(ChromeStorage.callbacks, callbackObj)
    }

	ChromeStorage.onLoad = function(callbackObj) {
		var ChromeStorage = this
		Object.assign(ChromeStorage.initFuncs, callbackObj)
	}

    /* ----
        Constructor
    */

	console.log("--- Loading from chrome.storage."+ChromeStorage.api)
	for (var property in sessionProperties) {
		if(sessionProperties.hasOwnProperty(property) ) {
			console.log("--- syncing "+property)
	        ChromeStorage.init(property, sessionProperties[property]);
		}
	}
}
