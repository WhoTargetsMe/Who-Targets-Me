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
		var postType = null

		var thisBatchN = $("a:contains('Sponsored')").length;
		$("a:contains('Sponsored')").each(function(index) {
			var advert_type_detect = $(this).closest('div');
			if(advert_type_detect.hasClass("_3dp")) {
				var advertiserHTML = $(this).closest('div').find('a:first-of-type').first();
				var top_level_post_id = /\[mf_story_key\]=([0-9]+)/.exec(advertiserHTML.attr('href'));
				postType = "page"
			}else if(advert_type_detect.hasClass("_5pcp")) {
				var advertiserHTML = $(this).closest('div').prev().find('.fwb').find('a:first-of-type').first();
				var top_level_post_id = /\[top_level_post_id\]=([0-9]+)/.exec(advertiserHTML.attr('href'));
			}



			var uiIndex = index+1;
			var advertiserName = advertiserHTML.text();
			var adContent = advertiserHTML.closest('.fbUserContent');

			// Check that it's an identifiable post
			if(!advertiserName || top_level_post_id == null || top_level_post_id.constructor !== Array) {
				config.devlog("- Disregarding suspected non-advert, No."+uiIndex+" of "+thisBatchN);
				inspectNextAd();
			} else {
				top_level_post_id = top_level_post_id[1];

				if(postType == null) {
					if(adContent.find('video').length > 0)
						postType = "video"
					else if(adContent.find('[data-tooltip-content][href^="/events/"]'))
						postType = "event"
					else
						postType = "other"
				}

				// config.devlog("Inspecting suspected advert No."+uiIndex+" of "+thisBatchN, snapshot.entity, snapshot.top_level_post_id);

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

				// Snapshots are sent to storage, and kept in user session history too.
				var snapshot = {
					entity: advertiserName,
					entityID: parseInt(advertiserHTML.attr('data-hovercard-obj-id')),
					entity_vanity: advertiserHTML.attr('href').split(/\/\?|\?/)[0].split('https://www.facebook.com/')[1],
					post_type: postType, /* other (default) | video | event */
					top_level_post_id: top_level_post_id,
					timestamp_created: parseInt(adContent.closest('[data-timestamp]').attr('data-timestamp')),
					timestamp_snapshot: parseInt(adContent.attr('WTM_timestamp_snapshot')) || parseInt((Date.now() / 1000).toFixed()),
					linkTo: linkTo,
					postText: adContent.find('.userContent').text(),
					fbStory_headline: adContent.find('.mbs._6m6._2cnj._5s6c, ._275z._5s6c').text(), // selectors for image, video
					fbStory_subtitle: adContent.find('._6m7._3bt9, ._5q4r').text(),
					thumbnailMedia: thumbnailMedia,
					html: adContent.find('._1dwg').html(),
					comments: parseFBnumber(adContent.find('[data-intl-translation^="{count} Comment"]').first().text().replace(/ Comments?/,"")),
					shares: parseFBnumber(adContent.find('[data-intl-translation^="{count} Share"]').first().text().replace(/ Shares?/,"")),
					views: parseFBnumber(adContent.find('[data-intl-translation^="{count} Views"]').first().text().replace(/ Views?/,"")),
					reactions: parseFBnumber(adContent.find('[aria-label="See who reacted to this"] + [href^="/ufi/reaction"] [data-tooltip-uri]').first().text())
				}

				var reactionTypes = ['Like','Love','Wow','Sad','Haha','Angry'];
				var reactions = 0;
				reactionTypes.forEach(function(reaction) {
					reactionCount = adContent.find(`[aria-label$="${reaction}"]`).text();
					reactionCount = parseFBnumber(reactionCount);
					snapshot["reactions"+reaction] = reactionCount;
					reactions += reactionCount;
				});

				saveSnapshot(adContent, snapshot);
			}

			function parseFBnumber(string) {
				if(!string || typeof string != 'string' || string == '') return null;

				string = string.trim().replace(/,/g, '');

				if(string.endsWith("k")) {
					string = parseFloat(string.slice(0,-1));
					string *= 1000;
				} else if(string.endsWith("M")) {
					string = parseFloat(string.slice(0,-1));
					string *= 1000000;
				}
				return parseInt(string);
			}

			function saveSnapshot(adContent, snapshot) {
				if (typeof adContent.attr('WTM_timestamp_snapshot') == typeof undefined || adContent.attr('WTM_timestamp_snapshot') == false) {
					config.devlog("+ Deemed a new ad",snapshot.entity, snapshot.top_level_post_id);
					newSessionHistory.push(snapshot);
					adContent.attr('WTM_timestamp_snapshot', snapshot.timestamp_snapshot);
				} else {
					config.devlog("! Already archived", snapshot.entity, snapshot.top_level_post_id);
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

			newSessionHistory.forEach(function(snapshot, index) {
				// Save the whole shabang to server
				config.devlog("Archiving new ad:",snapshot);

				if(userStorage.dateTokenGot != null) {
					config.devlog("Saving to server");
					$.ajax({
						type: 'post',
						url: config.APIURL+"/track/",
						dataType: 'json',
						data: snapshot,
					    headers: {"Access-Token": userStorage.access_token}
					}).done(function(data) {
						config.devlog(data.status);
						config.devlog("This new ad [SERVER SYNC'D] Advertiser: "+snapshot.entity+" - Advert ID: "+snapshot.top_level_post_id)
					}).fail(function(data) {
						config.devlog(data.status);
						config.devlog("Error saving this ad, backing up for later server save: "+snapshot.entity+" - Advert ID: "+snapshot.top_level_post_id);
						browserStorage.add('notServerSavedAds',snapshot);
					});
				} else {
					config.devlog("Backing up for server save, once access_token is received");
					browserStorage.add('notServerSavedAds',snapshot);
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
