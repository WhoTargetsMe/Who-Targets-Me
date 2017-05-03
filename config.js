var config = { DEV_ENV: typeof chrome.runtime.getManifest().update_url === 'undefined'}

config.APIURL = config.DEV_ENV ? "https://who-targets-me-staging.herokuapp.com" : "https://who-targets-me.herokuapp.com";

config.devlog = function() {
	if(config.DEV_ENV) console.log.apply(null, arguments);
}
