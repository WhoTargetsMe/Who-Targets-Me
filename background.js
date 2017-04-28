var userStorage = new ChromeStorage({ // Collect basic targeting data across user's devices
	'dateLastUserDetailsNotification': null,
	'dateInstalled': Date.now(),
	'dateTokenGot': null,
	'access_token': null
}, "sync")

userStorage.onLoad({
	'access_token': start,
	'dateInstalled': function(value, status) {
		console.log("DateInstalled", value, status);
		if(status == "init_new") {
			console.log("~~~ New user! Let's start with a clean chrome.storage slate, in case there are old values from previous versions ~~~")
			chrome.storage[ChromeStorage.api].clear();
		} else {
			console.log("~~~ Returning user :) ~~~")
		}
	}
})

var browserStorage = new ChromeStorage({ // Maintain a record of advert snapshots on this device
	notServerSavedAds: []
}, "local")

browserStorage.onLoad({
	'notServerSavedAds': function(value, status) {
		console.log("Loaded notServerSavedAds",browserStorage.notServerSavedAds,value,status)
		// Now we can backload old, locally stored ads to the server.
		if(browserStorage.notServerSavedAds != null && browserStorage.notServerSavedAds.constructor == Array && browserStorage.notServerSavedAds.length > 0) {
			console.log("Backing up user's un-saved browserStorage ad record",browserStorage.notServerSavedAds.length)
			browserStorage.notServerSavedAds.forEach(function(wholeShabang, index, theArray) {
				console.log("Now syncing",theArray.splice(index, 1));
				console.log("Remaining to sync",theArray);
				$.ajax({
					type: 'post',
					url: "https://who-targets-me.herokuapp.com/track/",
					dataType: 'json',
					data: wholeShabang,
					headers: {"Access-Token": userStorage.access_token}
				}).done(function(data) {
					console.log("[SERVER SYNC'D] Backloaded Old ad; Advertiser: "+wholeShabang.entity+" - Advert ID: "+wholeShabang.top_level_post_id)
				});
				browserStorage.set('notServerSavedAds', theArray);
			})
		} else {
			console.log("Yay. There are no ads to upload.",browserStorage.notServerSavedAds.length)
		}
	}
})

function start() {
	var regularCheckInterval = 2 * 60 * 60 * 1000 // hrs
	var notificationId = null;

	// If access_token is set later, close any open notification requesting it
	userStorage.onChange({'access_token': function(newValue,oldValue) {
		console.log("I heard access_token changed from "+oldValue+" to ",newValue,userStorage.access_token);
		userDetailsNotificationCheck();
	}});

	// If popup opens, close this access_token notification
	chrome.extension.onMessage.addListener(function(request,sender,sendResponse) {
	    if(request.notification === "hide") userDetailsNotificationCheck();
	    if(request.access_token_received) userDetailsNotificationCheck(request.access_token_received);
	})

	userDetailsNotificationCheck();

	function userDetailsNotificationCheck(access_token_received) {
		var regularAccessTokenPrompt = setInterval(userDetailsNotificationCheck, regularCheckInterval-100); // Push a notification every couple of hours, if user doesn't have access_token

		console.log("Checking for access_token",userStorage.access_token);

		if(userStorage.access_token == undefined || userStorage.access_token == null) {
			// Make notification asking for user details. Check if we've asked before, within a few hours.
			if(!isNaN(userStorage.dateLastUserDetailsNotification) && (Date.now() - userStorage.dateLastUserDetailsNotification) < regularCheckInterval+100) {
			   	console.log("Don't ask for user details too often. Last ask was only ",((Date.now() - userStorage.dateLastUserDetailsNotification)).toTime(),"ago")
			} else {
				console.log("No valid userStorage.access_token",userStorage.access_token);
				userStorage.set('dateLastUserDetailsNotification', Date.now());
				chrome.notifications.create({
		                type: "basic",
		                iconUrl: "logo-128.png",
		                title: "Activate WhoTargetsMe? ad tracking",
		                message: "Click the browser-bar icon to get started. We'll use your age, gender and postcode to better understand how parties target people."
		            }, function callback(thisNoteID) {
		                console.log("Notification pushed: "+thisNoteID);
						notificationId = thisNoteID;
		            }
		        )
			}
		} else {
			console.log("User got userStorage.access_token on ",new Date(userStorage.dateTokenGot),userStorage.access_token);
			clearInterval(regularAccessTokenPrompt);
			userDetailsNotificationClose();
		}
	}

	function userDetailsNotificationClose() {
		if(notificationId) {
			console.log("Closing Notification: "+notificationId);
			chrome.notifications.clear(notificationId)
		}
	}

}

Number.prototype.toTime = function(isSec) {
    var ms = isSec ? this * 1e3 : this,
        lm = ~(4 * !!isSec),  /* limit fraction */
        fmt = new Date(ms).toISOString().slice(11, lm);

    if (ms >= 8.64e7) {  /* >= 24 hours */
        var parts = fmt.split(/:(?=\d{2}:)/);
        parts[0] -= -24 * (ms / 8.64e7 | 0);
        return parts.join(':');
    }

    return fmt;
};
