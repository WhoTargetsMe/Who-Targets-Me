var userStorage = new ChromeStorage({ // Collect basic targeting data across user's devices
	targetingHistory: [],
	access_token: null
}, "sync")

userStorage.onChange({
	'access_token': function(access_token) {
		if(!access_token || access_token == undefined || access_token == nul) {
			console.log("No valid access_token",access_token);
			chrome.tabs.create({url: 'config.html' });
		} else {
			console.log("User has access_token",access_token);
		}
	}
})
