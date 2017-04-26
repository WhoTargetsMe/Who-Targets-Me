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

		thisBatchN = $("a:contains('Sponsored')").length;
		$("a:contains('Sponsored')").each(function(index) {
			var uiIndex = index+1;
			var advertiserHTML = $(this).closest('div').prev().find('a:first-of-type');
			var advertiserName = advertiserHTML.text();
			var top_level_post_id = /\[top_level_post_id\]=([0-9]+)/.exec(advertiserHTML.attr('href'));
			var advertiserID = advertiserHTML.attr('data-hovercard-obj-id');

			// Check that it's an identifiable post
			if(advertiserName && top_level_post_id != null && top_level_post_id.constructor === Array) {
				top_level_post_id = top_level_post_id[1];
				console.log("Inspecting suspected advert No."+uiIndex+" of "+thisBatchN,advertiserName,top_level_post_id);

				var adContent = $(this).closest('div').prev().find('a:first-of-type').closest('.fbUserContent');
				adContent.attr('WTM_timestamp_snapshot') ? console.log("!!! Already archived ",advertiserName,top_level_post_id) : console.log("+++ Probably new");

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
				var snapshot_meta = {
					entity: advertiserName,
					entityID: parseInt(advertiserID),
					top_level_post_id: parseInt(top_level_post_id),
					timestamp_created: parseInt(adContent.closest('[data-timestamp]').attr('data-timestamp')),
					// Divide by 1000 to match FB's `timestamp` property (^), which is in seconds, compatibility for PHP
					timestamp_snapshot: parseInt(adContent.attr('WTM_timestamp_snapshot')) || parseInt((Date.now() / 1000).toFixed()),
				}

				var snapshot_content = {
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
					// console.log("Processed Ad No.",uiIndex,advertiserName,top_level_post_id);
					adContent.attr('WTM_timestamp_snapshot', snapshot_meta.timestamp_snapshot);

					newSessionHistory.push({
						meta: snapshot_meta,
						content: snapshot_content,
						blobs: snapshot_blobs,
					});

					inspectNextAd();
				}
			} else {
				console.log("Inspecting suspected non-advert No."+uiIndex+" of "+thisBatchN);
				inspectNextAd();
			}

			function inspectNextAd() {
				if(uiIndex < thisBatchN) {
					// inspect next ad
				} else {
					// console.log("Inspection of "+thisBatchN+" adverts COMPLETE.");
					synchronise(newSessionHistory);
				}
			}
		})

		// See if there are adverts new to the `oldSessionHistory`, to be POST'd and SESSION'd
		function synchronise(newSessionHistory) {
			console.log("Sync'ing ads just found ("+newSessionHistory.length+") w/ ads this session's history ("+oldSessionHistory.length+").");
			console.log(newSessionHistory, oldSessionHistory)

			if(newSessionHistory.length == 0 || (newSessionHistory.length == oldSessionHistory.length
				&& newSessionHistory.slice(-1)[0].meta.top_level_post_id == oldSessionHistory.slice(-1)[0].meta.top_level_post_id)
			) {
				console.log("--No new adverts--",newSessionHistory.slice(-1)[0].meta.top_level_post_id,oldSessionHistory.slice(-1)[0].meta.top_level_post_id);
			} else {
				var diffLength = newSessionHistory.length - oldSessionHistory.length;
				newAdverts = newSessionHistory.slice(-1 * diffLength);

				newSessionHistory.forEach((x) => console.log("new:",x.meta.entity));
				oldSessionHistory.forEach((x) => console.log("old:",x.meta.entity));
				console.log("diff of "+diffLength, newAdverts);

				newAdverts.forEach(function(ad, index) {
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
						success: function(data) {
							console.log("This new ad [SERVER SYNC'D] Advertiser: "+wholeShabang.entity+" - Advert ID: "+wholeShabang.top_level_post_id, wholeShabang);
						}
					});
				})
				oldSessionHistory = newSessionHistory;
			}
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
