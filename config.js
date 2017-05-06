var config = { DEV_ENV: typeof chrome.runtime.getManifest().update_url === 'undefined'}

config.APIURL = "https://who-targets-me.herokuapp.com";

config.devlog = function() {
	if(config.DEV_ENV) console.log.apply(null, arguments);
}
