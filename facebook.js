var advertisers = [];
var savedSnapshots = [];
var processingAdvertIDs = []; // Will merge with 'savedSnapshots' in due course.
var storedAdvertIDs = []; // Retrieve from server, all post IDs (i.e. adverts) snapshotted

Array.prototype.diff = function(a) { // Polyfill diff function
	return this.filter(function(i) {return a.indexOf(i) < 0;});
};

$(document).ready(function() {
	window.setInterval(function(){
		var updated_advertisers = []
		$("a:contains('Sponsored')").each(function(index) {
			var advertiserHTML = $(this).closest('div').prev().find('a:first-of-type');
			var advertiserName = advertiserHTML.text();
			var top_level_post_id = /\[top_level_post_id\]=([0-9]+)/.exec(advertiserHTML.attr('href'));
			var advertiserID = advertiserHTML.attr('data-hovercard-obj-id');

			if(advertiserName && (
				(top_level_post_id != null && top_level_post_id.constructor === Array)
				/* try data-dedupekey or id=hyperfeed_story_id_... as alternative unique ID? */
			)) {
				top_level_post_id = top_level_post_id[1];
				updated_advertisers.push(advertiserName);
				var adContent = $(this).closest('div').prev().find('a:first-of-type').closest('.fbUserContent');

				// Store new adverts to DB
				if(!processingAdvertIDs.includes(top_level_post_id) && !storedAdvertIDs.includes(top_level_post_id)) {
					processingAdvertIDs.push(top_level_post_id);

					// Get image/video thumbnail URL
					if(adContent.find('.fbStoryAttachmentImage img')) {
						var thumbnailMedia = adContent.find('.fbStoryAttachmentImage img.scaledImageFitWidth').attr('src');
					} else {
						thumbnailMedia = adContent.find('video').attr('src');
					}

					// Get advert link-out
					var linkTo = adContent.find('.userContent').next().find('a').attr('href');
					if(linkTo.includes("l.facebook.com/l.php?")) {
						linkTo = getParameterByName('u',linkTo);
					} else {
						linkTo = decodeURIComponent(linkTo);
					}

					var snapshot = {
						entity: advertiserName,
						entityID: parseInt(advertiserID),
						timestamp_created: parseInt(adContent.closest('[data-timestamp]').attr('data-timestamp')),
						// Divide by 1000 to match the above, which is in seconds, compatibility for PHP
						timestamp_snapshot: parseInt((Date.now() / 1000).toFixed()),
						top_level_post_id: parseInt(top_level_post_id),
						html: adContent.html(),
						// May need to go through Facebook gateway, to get REAL url?
						linkTo: linkTo,
						postText: adContent.find('.userContent').text(),
						// Maybe we want to download and save these on our server?
						// Images are easy to store... but what about fb-locked videos?
						thumbnailMedia: thumbnailMedia,
						// the big/small text beneath thumbnail images. Definitely needs improving
						fbStory_headline: adContent.find('.mbs._6m6._2cnj._5s6c').text(),
						fbStory_subtitle: adContent.find('._6m7._3bt9').text(),
					};

					// Image snapshot
					html2canvas(adContent, {
						onrendered: function(canvas) {
							snapshot.imageRender = canvas.toDataURL("image/png")
							saveSnapshot();
						}
					});

					function saveSnapshot() {
						savedSnapshots.push(snapshot);
						console.log("[ARCHIVING] Advertiser: "+advertiserName+" - Advert ID: "+top_level_post_id, snapshot);

						// Requires server-side DB compatibility
						$.post("https://who-targets-me.herokuapp.com/analytics/", snapshot, function( data ) {
							console.log("[ARCHIVING COMPLETE] Advertiser: "+advertiserName+" - Advert ID: "+top_level_post_id);
							storedAdvertIDs.push(top_level_post_id); // now update server, too.
							console.log(storedAdvertIDs);
						});
					}
				} else {
					// console.log("[ALREADY ARCHIVED] Advertiser: "+advertiserName+" - Advert ID: "+top_level_post_id);
				}
			}
		})
		if(updated_advertisers.length !== advertisers.length) {
			// saveSponsoringEntity
			var new_advertisers = updated_advertisers.diff(advertisers)
			new_advertisers.map(function(advertiser, index) {
				$.post("https://who-targets-me.herokuapp.com/analytics/", {entity: advertiser}, function( data ) {
					//console.log(data)
				});
			})
			advertisers = updated_advertisers
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
