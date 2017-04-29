// `api.storage.sync()` utlity class
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

// For firefox compatibility
var api = navigator.userAgent.indexOf('Chrome') >= 0 ? chrome : browser;

var ChromeStorage = function(sessionProperties, method = "sync", initCb) {
    var ChromeStorage = this

	ChromeStorage.api = method
    ChromeStorage.callbacks = {}
    ChromeStorage.initFuncs = {}

	// Use when you need to nuke, during testing
	// chrome.storage[ChromeStorage.api].clear()

    /* ----
        Class methods
    */

    ChromeStorage.set = function(property,value,cb,method = "set") {
        var ChromeStorage = this
        ChromeStorage[property] = value

        var keyValue = {}
        keyValue[property] = value

        chrome.storage[ChromeStorage.api].set(
            keyValue,
            function sentToStorage() {
                console.log("[storage."+ChromeStorage.api+"] SET ChromeStorage."+ChromeStorage.api+"."+property+" = ",value)
                // if(typeof ChromeStorage.callbacks[property] === 'function') ChromeStorage.callbacks[property](value,method)
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

    ChromeStorage.get = function(property,cb,method = "get") {
        var ChromeStorage = this
        chrome.storage[ChromeStorage.api].get(property, function receivedPropertyFromStorage(requestedStorage) {
            console.log("[storage."+ChromeStorage.api+"] GET ChromeStorage."+ChromeStorage.api+"."+property+" = ",requestedStorage[property])
            ChromeStorage[property] = requestedStorage[property]
            if(typeof cb === 'function') cb(ChromeStorage[property])
        })
    }

	ChromeStorage.init = function(property,defaultValue) {
        var ChromeStorage = this;
		ChromeStorage.get(property, function(storageValue) {
			if(storageValue != undefined) {
				console.log("[storage."+ChromeStorage.api+"] Synced "+property+" with server: ",storageValue)
				if(typeof ChromeStorage.initFuncs[property] === 'function') {
					ChromeStorage.initFuncs[property](ChromeStorage[property],"init_restore");
				}
			} else {
				console.log("[storage."+ChromeStorage.api+"] Resetting "+property+" to ",defaultValue)
				ChromeStorage.set(property,defaultValue,function() {
					if(typeof ChromeStorage.initFuncs[property] === 'function') {
						ChromeStorage.initFuncs[property](ChromeStorage[property],"init_new");
					}
				});
			}

            if ((initCb !== undefined) && (initCb !== null)) {
                initCb();
            }
		});
	}

    ChromeStorage.onChange = function(callbackObj) {
        var ChromeStorage = this
		Object.assign(ChromeStorage.callbacks, callbackObj)
    }

	chrome.storage.onChanged.addListener(function(changedProperties,api) {
		if(api == ChromeStorage.api) {
			// console.log("[storage."+ChromeStorage.api+"] changes",changedProperties)
			for (var property in changedProperties) {
				ChromeStorage[property] = changedProperties[property].newValue;

				if(typeof ChromeStorage.callbacks[property] === 'function') {
					console.log("[storage."+ChromeStorage.api+"] Responding to onChange for "+ChromeStorage.api+"."+property,changedProperties[property]);
					ChromeStorage.callbacks[property](changedProperties[property].newValue,changedProperties[property].oldValue);
				}
			}
		}
	});

	ChromeStorage.onLoad = function(callbackObj) {
		var ChromeStorage = this
		Object.assign(ChromeStorage.initFuncs, callbackObj)
	}

    /* ----
        Constructor
    */

	console.log("[storage."+ChromeStorage.api+"] --- Loading from chrome.storage."+ChromeStorage.api)
	for (var property in sessionProperties) {
		if(sessionProperties.hasOwnProperty(property) ) {
			console.log("[storage."+ChromeStorage.api+"] ----- syncing "+ChromeStorage.api+"."+property)
	        ChromeStorage.init(property, sessionProperties[property]);
		}
	}
}
