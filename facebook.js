var userStorage = new ChromeStorage({ // Collect basic targeting data across user's devices
	targetingHistory: [],
	access_token: null
}, "sync")

var browserStorage = new ChromeStorage({ // Maintain a record of advert snapshots on this device
	advertArchive: [],
}, "local")

$(document).ready(function() {
	var oldSessionHistory = []

	window.setInterval(function() {
		var newSessionHistory = []

		var thisBatchN = $("a:contains('Sponsored')").length;
		$("a:contains('Sponsored')").each(function(index) {
			var uiIndex = index+1;
			var advertiserHTML = $(this).closest('div').prev().find('a:first-of-type');
			var top_level_post_id = /\[top_level_post_id\]=([0-9]+)/.exec(advertiserHTML.attr('href'));
			var advertiserName = advertiserHTML.text();
			var advertiserID = advertiserHTML.attr('data-hovercard-obj-id');
			var adContent = advertiserHTML.closest('.fbUserContent');

			// Check that it's an identifiable post
			if(!advertiserName || top_level_post_id == null || top_level_post_id.constructor !== Array) {
				console.log("- Disregarding suspected non-advert, No."+uiIndex+" of "+thisBatchN);
				inspectNextAd();
			} else {
				top_level_post_id = top_level_post_id[1];

				// Snapshots are sent to storage, and kept in user session history too.
				var snapshot = {
					meta: {
						entity: advertiserName,
						entityID: parseInt(advertiserID),
						top_level_post_id: parseInt(top_level_post_id),
						timestamp_created: parseInt(adContent.closest('[data-timestamp]').attr('data-timestamp')),
						// Divide by 1000 to match FB's `timestamp` property (^), which is in seconds, compatibility for PHP
						timestamp_snapshot: parseInt(adContent.attr('WTM_timestamp_snapshot')) || parseInt((Date.now() / 1000).toFixed()),
					}
				}

				// console.log("Inspecting suspected advert No."+uiIndex+" of "+thisBatchN, snapshot.meta.entity, snapshot.meta.top_level_post_id);

				// Get image/video thumbnail URL
				if(adContent.find('.fbStoryAttachmentImage'))
					var thumbnailMedia = adContent.find('.fbStoryAttachmentImage img.scaledImageFitWidth').attr('src');
				else if(adContent.find('video'))
					var thumbnailMedia = adContent.find('video[muted]').attr('src');
				else
					var thumbnailMedia = null; // fail

				// Get advert link-out
				var linkTo = adContent.find('.userContent').next().find('a').attr('href');
					linkTo = linkTo.includes("l.facebook.com/l.php?") ? getParameterByName('u',linkTo) : decodeURIComponent(linkTo);

				snapshot.content = {
					// May need to go through Facebook gateway, to get REAL url?
					linkTo: linkTo,
					postText: adContent.find('.userContent').text(),
					// the big/small text beneath thumbnail images; captures the majority of cases, but not all
					fbStory_headline: adContent.find('.mbs._6m6._2cnj._5s6c, ._275z._5s6c').text(), // selectors for image, video
					fbStory_subtitle: adContent.find('._6m7._3bt9, ._5q4r').text(),
					// Maybe we want to download and save these on our server?
					// Images are easy to store... but what about fb-locked videos?
					thumbnailMedia: thumbnailMedia,
				}

				// snapshot.blobs are for server storage only.
				snapshot.blobs = {
					html: adContent.html()
				};

				saveSnapshot(adContent, snapshot);
			}

			function saveSnapshot(adContent, snapshot) {
				if (typeof adContent.attr('WTM_timestamp_snapshot') == typeof undefined || adContent.attr('WTM_timestamp_snapshot') == false) {
					console.log("+ Deemed a new ad",snapshot.meta.entity, snapshot.meta.top_level_post_id);
					newSessionHistory.push(snapshot);
					adContent.attr('WTM_timestamp_snapshot', snapshot.meta.timestamp_snapshot);
				} else {
					console.log("! Already archived", snapshot.meta.entity, snapshot.meta.top_level_post_id);
				}

				inspectNextAd();
			}

			function inspectNextAd() {
				if(uiIndex < thisBatchN) {
					// inspect next ad
				} else if(newSessionHistory.length > 0) {
					console.log("Sync'ing ads just found ("+newSessionHistory.length+")");
					synchronise(newSessionHistory);
				} else {
					console.log("--No new adverts--");
				}
			}
		})

		// See if there are adverts to be POST'd and SESSION'd
		function synchronise(newSessionHistory) {
			if(newSessionHistory.length < 1) { return false; }

			newSessionHistory.forEach(function(ad, index) {
				// Only save small text to user session
				userStorage.add('targetingHistory', ad.meta);
				var browserSnapshot = Object.assign({}, ad.meta, ad.content);
				browserStorage.add('advertArchive', browserSnapshot);
				console.log("New ad [USER SYNC'D] Advertiser: "+browserSnapshot.entity+" - Advert ID: "+browserSnapshot.top_level_post_id, browserSnapshot);
				// Save the whole shabang to server
				var wholeShabang = Object.assign({}, ad.meta, ad.content, ad.blobs);
				$.ajax({
					type: 'post',
					url: "https://who-targets-me.herokuapp.com/track/",
					dataType: 'json',
					data: wholeShabang,
				    headers: {"HTTP_ACCESS_TOKEN": userStorage.access_token},
					success: (data) => console.log("This new ad [SERVER SYNC'D] Advertiser: "+wholeShabang.entity+" - Advert ID: "+wholeShabang.top_level_post_id, wholeShabang)
				});
			})
			oldSessionHistory.push(newSessionHistory);
			newSessionHistory = [];
		}
	}, 5000);
});

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
