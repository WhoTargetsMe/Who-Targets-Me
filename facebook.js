var userStorage = new ChromeStorage({ // Collect basic targeting data across user's devices
	access_token: null,
	dateTokenGot: null
}, "sync")

var browserStorage = new ChromeStorage({ // Maintain a record of advert snapshots on this device
	notServerSavedAds: []
}, "local")

$(document).ready(function() {
	var oldSessionHistory = []

	window.setInterval(function() {
		var newSessionHistory = []

		var thisBatchN = $("a:contains('Sponsored')").length;
		$("a:contains('Sponsored')").each(function(index) {
			var uiIndex = index+1;
			var advertiserHTML = $(this).closest('div').prev().find('a:first-of-type').first();
			var top_level_post_id = /\[top_level_post_id\]=([0-9]+)/.exec(advertiserHTML.attr('href'));
			var advertiserName = advertiserHTML.text();
			var adContent = advertiserHTML.closest('.fbUserContent');

			// Check that it's an identifiable post
			if(!advertiserName || top_level_post_id == null || top_level_post_id.constructor !== Array) {
				config.devlog("- Disregarding suspected non-advert, No."+uiIndex+" of "+thisBatchN);
				inspectNextAd();
			} else {
				top_level_post_id = top_level_post_id[1];

				if(adContent.find('video').length > 0)
					var postType = "video"
				else if(adContent.find('[data-tooltip-content][href^="/events/"]'))
					var postType = "event"
				else
					var postType = "other"

				// Snapshots are sent to storage, and kept in user session history too.
				var snapshot = {
					meta: {
						entity: advertiserName,
						entityID: parseInt(advertiserHTML.attr('data-hovercard-obj-id')),
						entity_vanity: advertiserHTML.attr('href').split(/\/\?|\?/)[0].split('https://www.facebook.com/')[1],
						post_type: postType, /* other (default) | video | event */
						top_level_post_id: parseInt(top_level_post_id),
						timestamp_created: parseInt(adContent.closest('[data-timestamp]').attr('data-timestamp')),
						// Divide by 1000 to match FB's `timestamp` property (^), which is in seconds, compatibility for PHP
						timestamp_snapshot: parseInt(adContent.attr('WTM_timestamp_snapshot')) || parseInt((Date.now() / 1000).toFixed()),
					}
				}

				// config.devlog("Inspecting suspected advert No."+uiIndex+" of "+thisBatchN, snapshot.meta.entity, snapshot.meta.top_level_post_id);

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
					config.devlog("+ Deemed a new ad",snapshot.meta.entity, snapshot.meta.top_level_post_id);
					newSessionHistory.push(snapshot);
					adContent.attr('WTM_timestamp_snapshot', snapshot.meta.timestamp_snapshot);
				} else {
					config.devlog("! Already archived", snapshot.meta.entity, snapshot.meta.top_level_post_id);
				}

				inspectNextAd();
			}

			function inspectNextAd() {
				if(uiIndex < thisBatchN) {
					// inspect next ad
				} else if(newSessionHistory.length > 0) {
					config.devlog("Sync'ing ads just found ("+newSessionHistory.length+")");
					synchronise(newSessionHistory);
				} else {
					config.devlog("--No new adverts--");
				}
			}
		})

		// See if there are adverts to be POST'd and SESSION'd
		function synchronise(newSessionHistory) {
			if(newSessionHistory.length < 1) { return false; }

			newSessionHistory.forEach(function(ad, index) {
				// Save the whole shabang to server
				var wholeShabang = Object.assign({}, ad.meta, ad.content, ad.blobs);
				config.devlog("Archiving new ad:",wholeShabang);

				if(userStorage.dateTokenGot != null) {
					config.devlog("Saving to server");
					$.ajax({
						type: 'post',
						url: config.APIURL+"/track/",
						dataType: 'json',
						data: wholeShabang,
					    headers: {"Access-Token": userStorage.access_token}
					}).done(function(data) {
						config.devlog(data.status);
						config.devlog("This new ad [SERVER SYNC'D] Advertiser: "+wholeShabang.entity+" - Advert ID: "+wholeShabang.top_level_post_id)
					}).fail(function(data) {
						config.devlog(data.status);
						config.devlog("Error saving this ad, backing up for later server save: "+wholeShabang.entity+" - Advert ID: "+wholeShabang.top_level_post_id);
						browserStorage.add('notServerSavedAds',wholeShabang);
					});
				} else {
					config.devlog("Backing up for server save, once access_token is received");
					browserStorage.add('notServerSavedAds',wholeShabang);
				}
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
