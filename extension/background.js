/* ----
	Logic for notification prompts to send user data, receive access_token
*/

var userStorage = new ChromeStorage({ // Collect basic targeting data across user's devices
	'dateInstalled': Date.now(),
	'dateTokenGot': null,
	'dateLastUserDetailsNotification': null,
	'access_token': null,
	'hasShownElectionNotification': false
}, {
	api: "sync",
	initCb: function() {
		// userStorage.nuke();
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
		chrome.runtime.onMessage.addListener(function(request,sender,sendResponse) {
		    if(request.notification === "hide") checkAccessToken();
		    if(request.access_token_received) checkAccessToken(request.access_token_received);
			if(request.access_token_request) chrome.runtime.sendMessage({access_token_sent: [true,userStorage.access_token]});
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
		startNotificationElectionDay();
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

function startNotificationElectionDay() {
	console.log("Starting election day notification creator.");
	// Make notification asking for user details. Check if we've asked before, within a few hours.
	if(userStorage.hasShownElectionNotification) {
		console.log("User has been shown election notification")
	} else {
		userStorage.set('hasShownElectionNotification', true);
		chrome.notifications.create({
				type: "basic",
				iconUrl: "logo-128.png",
				title: "Find out who targeted you this election!",
				message: "Click the browser-bar icon to see your stats"
			}, function callback(thisNoteID) {
				console.log("Notification pushed: "+thisNoteID);
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

var currentlyBackingUp = false;
function backupAdverts() {
	if(currentlyBackingUp == true) return console.log("Currently backing up, don't double the efforts"); // Prevent double-recording of data
	else currentlyBackingUp = true; // Lock the function

	// Consider backing data up, if there's an access_token
	var browserStorage = new ChromeStorage({ // Maintain a record of advert snapshots on this device
		notServerSavedAds: []
	}, {
		api: "local",
		initCb: function() {
			// browserStorage.nuke();
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
				console.log("Now backing up:",wholeShabang);
				console.log("Remaining ads to back up, right now:",theArray);
				$.ajax({
					type: 'post',
					url: config.APIURL+"/track/",
					dataType: 'json',
					data: wholeShabang,
					headers: {"Access-Token": userStorage.access_token}
				}).done(function(data) {
					console.log(data.status);
					console.log("[SERVER SYNC'D] Backloaded Old ad; Advertiser: "+wholeShabang.entity+" - Advert ID: "+wholeShabang.hyperfeed_story_id);
					registerResults(wholeShabang,"success", theArray);
				}).fail(function(data) {
					console.log(data.status);
					console.log("[SERVER FAILURE] Could not backup data, keeping "+wholeShabang.entity,wholeShabang.hyperfeed_story_id+" for future backup");
					registerResults(wholeShabang,"failure", theArray);
				});
			});
			browserStorage.set('notServerSavedAds',[]); // clear these backups (new ones might come whilst we're working)

			// Save failed backups for another try.
			var count = 0;
			var failedBackups = [];
			function registerResults(item,status,theArray) {
				count++;
				if(status=="failure") failedBackups.push(item);
				console.log(status," - tried backing up Ad #"+count+" of "+theArray.length)

				if(count == theArray.length) {
					console.log("All backups attempted!");
					if(failedBackups.length > 0) console.log("Some backups failed :( ",failedBackups);
					else console.log("All backups successful :) ",failedBackups);

					// Combine the ads that didn't successfully backup, with any new backup ads that haven't been processed yet
					browserStorage.set('notServerSavedAds', browserStorage.notServerSavedAds.concat(failedBackups), function() {
						console.log("New backup list = ",browserStorage.notServerSavedAds);
						currentlyBackingUp = false; // Unlock the function
					});
				}
			}
		}
	});
}

// oldBackup -> foreach
// oldBackup.clear();
// newBackup + failedBackup = oldBackup

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
