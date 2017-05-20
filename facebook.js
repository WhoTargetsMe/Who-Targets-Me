// Facebook ad scanning class now held in config.js
// In order to make it accessible to testing suite
// Cannot make new file due to manifest.json update restrictions

var WhoTargetsMe = new FbAdCheck();

$(document).ready(function() {
	WhoTargetsMe.watch(5000);
});
