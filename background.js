var userStorage = new ChromeStorage({ // Collect basic targeting data across user's devices
	targetingHistory: [],
	access_token: null
}, "sync")

userStorage.onLoad({
	'access_token': checkForToken
});

setTimeout(function() {
	userStorage.onChange({
		'access_token': checkForToken
	});
}, 3000);

function checkForToken() {
	if(!userStorage.access_token || userStorage.access_token == undefined || userStorage.access_token == nul) {
		console.log("No valid userStorage.access_token",userStorage.access_token);
		chrome.browserAction.setPopup({popup: "config.html"});
		chrome.tabs.create({url: 'config.html' });
	} else {
		console.log("User has userStorage.access_token",userStorage.access_token);
		chrome.browserAction.setPopup({popup: "popup.html"});
		clearInterval(accessTokenPrompt);
	}
}

var accessTokenPrompt = setInterval(checkForToken, 60 * 60 * 1000); // Prompt once an hour
