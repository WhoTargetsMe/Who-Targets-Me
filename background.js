var userStorage = new ChromeStorage({ // Collect basic targeting data across user's devices
	'dateLastUserDetailsNotification': null,
	'dateInstalled': Date.now(),
	'dateTokenGot': null,
	'access_token': null,
}, "sync");

userStorage.onLoad({
	'access_token': start
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
