var userStorage = new Session({
	advertHistory: []
})

var currentSessionHistory = []; // HTML / image data too large to store in `chrome.storage`

Array.prototype.diff = function(a) { // Polyfill diff function
	return this.filter(function(i) {return a.indexOf(i) < 0;});
};

$(document).ready(function() {
	window.setInterval(function() {
		var updatedSessionHistory = []

		thisBatchN = $("a:contains('Sponsored')").length;
		$("a:contains('Sponsored')").each(function(index) {
			var advertiserHTML = $(this).closest('div').prev().find('a:first-of-type');
			var advertiserName = advertiserHTML.text();
			var top_level_post_id = /\[top_level_post_id\]=([0-9]+)/.exec(advertiserHTML.attr('href'));
			var advertiserID = advertiserHTML.attr('data-hovercard-obj-id');

			// Check that it's an identifiable post
			if(advertiserName && top_level_post_id != null && top_level_post_id.constructor === Array) {
				top_level_post_id = top_level_post_id[1];
				var adContent = $(this).closest('div').prev().find('a:first-of-type').closest('.fbUserContent');

				// Get image/video thumbnail URL
				if(adContent.find('.fbStoryAttachmentImage')) {
					var thumbnailMedia = adContent.find('.fbStoryAttachmentImage img.scaledImageFitWidth').attr('src');
				} else if(adContent.find('video')) {
					var thumbnailMedia = adContent.find('video[muted]').attr('src');
				} else {
					thumbnailMedia = null; // fail
				}

				// Get advert link-out
				var linkTo = adContent.find('.userContent').next().find('a').attr('href');
				if(linkTo.includes("l.facebook.com/l.php?")) {
					linkTo = getParameterByName('u',linkTo);
				} else {
					linkTo = decodeURIComponent(linkTo);
				}

				// Snapshots are sent to storage, and kept in user session history too.
				var snapshot = {
					entity: advertiserName,
					entityID: parseInt(advertiserID),
					timestamp_created: parseInt(adContent.closest('[data-timestamp]').attr('data-timestamp')),
					// Divide by 1000 to match the above, which is in seconds, compatibility for PHP
					timestamp_snapshot: parseInt((Date.now() / 1000).toFixed()),
					top_level_post_id: parseInt(top_level_post_id),
					// May need to go through Facebook gateway, to get REAL url?
					linkTo: linkTo,
					postText: adContent.find('.userContent').text(),
					// the big/small text beneath thumbnail images
					// captures the majority of cases, but not all
					fbStory_headline: adContent.find('.mbs._6m6._2cnj._5s6c, ._275z._5s6c').text(), // selectors for image, video
					fbStory_subtitle: adContent.find('._6m7._3bt9, ._5q4r').text(),
					// Maybe we want to download and save these on our server?
					// Images are easy to store... but what about fb-locked videos?
					thumbnailMedia: thumbnailMedia,
				}

				// snapshot_blobs are for server storage only.
				var snapshot_blobs = {
					html: adContent.html()
				};

				// Image snapshot
				if(false) { // Bypass html2canvas for now, it's a tad crap
					html2canvas(adContent, {
						onrendered: function(canvas) {
							snapshot_blobs.imageRender = canvas.toDataURL("image/png")
							saveSnapshot();
						}
					});
				} else {
					saveSnapshot();
				}

				function saveSnapshot() {
					// console.log("Noted an ad by "+snapshot.entity,snapshot.top_level_post_id)
					updatedSessionHistory.push({'snapshot':snapshot,'snapshot_blobs':snapshot_blobs});
					if(index == thisBatchN-1) {
						synchronise(updatedSessionHistory);
					}
				}
			}
		})

		function synchronise(updatedSessionHistory) {
			console.log("Sync'ing ads just found ("+updatedSessionHistory.length+") w/ ads this session's history ("+currentSessionHistory.length+").");
			// See if there are adverts new to the `currentSessionHistory`, to be POST'd and SESSION'd
			if(updatedSessionHistory.length != currentSessionHistory.length) {
				var newAdverts = updatedSessionHistory.diff(currentSessionHistory)
				newAdverts.map(function(ad, index) {
					// Only save small text to user session
					userStorage.add('advertHistory', ad.snapshot);
					console.log("New ad [USER SYNC'D] Advertiser: "+ad.snapshot.entity+" - Advert ID: "+ad.snapshot.top_level_post_id, ad.snapshot);
					// Save the whole shabang to server
					var wholeShabang = Object.assign({}, ad.snapshot, ad.snapshot_blobs);
					$.post("https://who-targets-me.herokuapp.com/analytics/", wholeShabang, function( data ) {
						console.log("This new ad [SERVER SYNC'D] Advertiser: "+wholeShabang.entity+" - Advert ID: "+wholeShabang.top_level_post_id, wholeShabang);
					});
				})
				currentSessionHistory = updatedSessionHistory;
			}
		}
	}, 5000);
});

var timestamp = Math.floor(Date.now());
function updateAdvertDB(timestamp, data) {
	chrome.storage.sync.set({timestamp: data}, function() {
		console.log("Data saved");
	});
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
