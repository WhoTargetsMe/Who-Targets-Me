var userStorage = new ChromeStorage({ // Collect basic targeting data across user's devices
	access_token: null
}, "sync")

userStorage.onLoad({
	'access_token': checkForToken
})

function checkForToken() {
	if(!userStorage.access_token || userStorage.access_token == undefined || userStorage.access_token == null) {
		console.log("No valid userStorage.access_token",userStorage.access_token);
	} else {
		console.log("User has userStorage.access_token",userStorage.access_token);
	}
}
