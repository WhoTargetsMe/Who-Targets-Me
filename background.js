/* ----
	Logic for notification prompts to send user data, receive access_token
*/

var userStorage = new ChromeStorage({ // Collect basic targeting data across user's devices
	'dateInstalled': Date.now(),
	'dateTokenGot': null,
	'dateLastUserDetailsNotification': null,
	'access_token': null
}, {
	api: "sync",
	initCb: function() {
		// Separate interval for backups, every hour.
		// E.g. if user is temporarily offline and new ads are locally backed up
		// 		AND user doesn't regularly re-open Chrome, so won't get the initial backup check.
		setInterval(backupAdverts, 1 * 60 * 60 * 1000);
		checkAccessToken();

		// If access_token is retrieved later...
		userStorage.onChange({'access_token': function(newValue,oldValue) {
			console.log("I heard access_token changed from "+oldValue+" to ",newValue,userStorage.access_token);
			checkAccessToken();
		}});

		// If popup opens, close any access_token notification prompts
		chrome.extension.onMessage.addListener(function(request,sender,sendResponse) {
		    if(request.notification === "hide") checkAccessToken();
		    if(request.access_token_received) checkAccessToken(request.access_token_received);
		})
	}
})

var notificationId = null;
var checkInterval = 2 * 60 * 60 * 1000 // hrs
var regularAccessTokenPrompt;

function checkAccessToken(access_token_received) {
	regularAccessTokenPrompt = setInterval(checkAccessToken, checkInterval-100); // Push a notification every couple of hours, if user doesn't have access_token

	if(userStorage.access_token == undefined || userStorage.access_token == null) {
		console.log("No valid userStorage.access_token",userStorage.access_token);
		startNotification();
	} else {
		console.log("User got userStorage.access_token on ",new Date(userStorage.dateTokenGot),userStorage.access_token);
		stopNotifications();
		backupAdverts();
	}
}

function startNotification() {
	console.log("Starting notification creator.");
	// Make notification asking for user details. Check if we've asked before, within a few hours.
	if(!isNaN(userStorage.dateLastUserDetailsNotification) && (Date.now() - userStorage.dateLastUserDetailsNotification) < checkInterval+100) {
		console.log("Actually... let's ask again in "+(new Date(userStorage.dateLastUserDetailsNotification + checkInterval) - Date.now()).toTime()+". Last ask was *only* ",((Date.now() - userStorage.dateLastUserDetailsNotification)).toTime(),"ago.")
	} else {
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
}

function stopNotifications() {
	clearInterval(regularAccessTokenPrompt);

	// Close notification if access_token received
	if(notificationId) {
		console.log("Closing Notification: "+notificationId);
		chrome.notifications.clear(notificationId)
	}
}

function backupAdverts() {
	// Consider backing data up, if there's an access_token
	var browserStorage = new ChromeStorage({ // Maintain a record of advert snapshots on this device
		notServerSavedAds: []
	}, {
		api: "local",
		initCb: function() {
			// If there are ads to backup...
			if(browserStorage.notServerSavedAds == null
			|| browserStorage.notServerSavedAds.constructor != Array
			|| browserStorage.notServerSavedAds.length == 0
			) return console.log("Yay, there are no ads to upload.",browserStorage.notServerSavedAds.length);
			else console.log("There are ",browserStorage.notServerSavedAds.length," ads to back up.");

			// ... and we have access to the DB...
			if(userStorage.access_token == undefined
			|| userStorage.access_token == null
			) return console.log("Unfortunately, cannot backup to server as access_token is ",userStorage.access_token);
			else console.log("Backing ads up with access_token:",userStorage.access_token);

			// Then backup!
			browserStorage.notServerSavedAds.forEach(function(wholeShabang, index, theArray) {
				theArray.splice(index, 1);
				console.log("Now backing up:",wholeShabang);
				console.log("Remaining ads to back up, right now:",theArray);
				$.ajax({
					type: 'post',
					url: "https://who-targets-me.herokuapp.com/track/",
					dataType: 'json',
					data: wholeShabang,
					headers: {"Access-Token": userStorage.access_token}
				}).done(function(data) {
					console.log(data.status);
					console.log("[SERVER SYNC'D] Backloaded Old ad; Advertiser: "+wholeShabang.entity+" - Advert ID: "+wholeShabang.top_level_post_id)
					browserStorage.set('notServerSavedAds', theArray);
				}).fail(function(data) {
					console.log(data.status);
					console.log("[SERVER FAILURE] Could not backup data, keeping "+wholeShabang.entity,wholeShabang.top_level_post_id+" for future backup");
				});
			});
		}
	});
}

/* ----
	Utils
*/

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
