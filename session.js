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

/* Possible `options` (all optional)
	"sync"
	"local"
	{
		api: "sync" | "local",
		initCb: function
	}
*/
var ChromeStorage = function(sessionProperties, options = "sync") {
    var ChromeStorage = this

	ChromeStorage.api = options === Object(options) ? options.api : options;
	ChromeStorage.initCb = (options === Object(options) && typeof options.initCb === 'function') ? options.initCb : null;
	ChromeStorage.callbacks = {}
    ChromeStorage.initFuncs = {}
    ChromeStorage.properties = []

	// Use when you need to nuke, during testing
	// chrome.storage[ChromeStorage.api].clear()

    /* ----
        Public methods
    */

    ChromeStorage.onChange = function(callbackObj) {
        var ChromeStorage = this
		Object.assign(ChromeStorage.callbacks, callbackObj)
    }

	ChromeStorage.onLoad = function(callbackObj) {
		var ChromeStorage = this
		Object.assign(ChromeStorage.initFuncs, callbackObj)
	}

    ChromeStorage.get = function(property,cb,method = "get") {
        var ChromeStorage = this
        chrome.storage[ChromeStorage.api].get(property, function receivedPropertyFromStorage(requestedStorage) {
            console.log("[storage."+ChromeStorage.api+"] GET "+ChromeStorage.api+"."+property+" = ",requestedStorage[property])
            ChromeStorage[property] = requestedStorage[property]
            if(typeof cb === 'function') cb(ChromeStorage[property])
        })
    }

	ChromeStorage.set = function(property,value,cb,method = "set") {
		var ChromeStorage = this
		ChromeStorage[property] = value

		var keyValue = {}
		keyValue[property] = value

		chrome.storage[ChromeStorage.api].set(
			keyValue,
			function sentToStorage() {
				console.log("[storage."+ChromeStorage.api+"] SET "+ChromeStorage.api+"."+property+" = ",value)
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

	/* ----
		Private methods
	*/

	ChromeStorage.initProperty = function(property,defaultValue,i,N) {
        var ChromeStorage = this;
		ChromeStorage.get(property, function(storageValue) {
			if(storageValue != undefined) {
				console.log("[storage."+ChromeStorage.api+"] Loaded EXISTING property "+property+": ",storageValue)
				initCheck(i,N,property,"init_restore");
			} else {
				ChromeStorage.set(property,defaultValue,function() {
					console.log("[storage."+ChromeStorage.api+"] Created NEW property "+property+": ",defaultValue)
					initCheck(i,N,property,"init_new");
				});
			}
		});

		function initCheck(i,N,property,method) {
			// Check if property has an `onLoad` listener function
			if(typeof ChromeStorage.initFuncs[property] === 'function') ChromeStorage.initFuncs[property](ChromeStorage[property],method);
			// If all properties have been loaded, check for a global `onLoad` function
			if(i+1 == N) {
				console.log("[storage."+ChromeStorage.api+"] All properties initialised!");
				if(typeof ChromeStorage.initCb === 'function') ChromeStorage.initCb();
			}
		}
	}

    /* ----
        Constructor
    */

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

	for (var property in sessionProperties) {
		if(sessionProperties.hasOwnProperty(property) ) {
			ChromeStorage.properties.push(property);
		}
	}
	console.log("[storage."+ChromeStorage.api+"] --- Loading the following from chrome.storage."+ChromeStorage.api,ChromeStorage.properties)
	ChromeStorage.properties.forEach(function(property, i, props) {
		console.log("[storage."+ChromeStorage.api+"] ----- loading "+ChromeStorage.api+"."+property)
		ChromeStorage.initProperty(property, sessionProperties[property], i, props.length);
	})
}
