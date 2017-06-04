var config = { DEV_ENV: typeof chrome.runtime.getManifest !== 'function' || typeof chrome.runtime.getManifest().update_url === 'undefined' }

config.APIURL = "https://who-targets-me.herokuapp.com";

config.devlog = function() {
	if(config.DEV_ENV) console.log.apply(null, arguments);
}

// ideally this'd be in `fbparser.js`, but we can't change the manifest anymore...
function FbAdCheck(test = false, defer) {
	var FbAdCheck = this
	var WTMdata = defer || FbAdCheck

	// To prevent duplicates of the same exact post, we use a Set of unique 'hyperfeed_story_id's
	// These are unique IDs assigned to post instances in the timeline.
	// They are not indexes of adverts
	// 		(which is important: the same advert might pop up twice, right?)
	WTMdata.oldAds = new Set();
	WTMdata.newAds = new Set();

	// This is where we store the advert data, index by hyperfeed_story_id
	WTMdata.archives = {};

	// Initiate regular scanning
	FbAdCheck.watch = function(interval = 2000) {
		config.devlog(`WTM: Scanning FB every ${interval/1000} seconds`);
		if(FbAdCheck.watchClock) clearInterval(FbAdCheck.watchClock);
		FbAdCheck.watchClock = window.setInterval(function() {
			FbAdCheck.scan();
		}, interval);
	}

	// A single, full-cycle parse of the page, as it is.
	FbAdCheck.scan = function() {
		WTMdata.newAds = [];

		// Identify sponsored posts
		FbAdCheck.getAds(() => {
			if(WTMdata.newAds && WTMdata.newAds.size == 0) return config.devlog("--- No new adverts to parse "+WTMdata.newAds)

			config.devlog("Parsing new adverts "+WTMdata.newAds);
			// Parse each sponsored post found, add to newAds
			WTMdata.newAds.forEach((hyperfeed_story_id) => {
				// Get the referenced snapshot
				var ad = WTMdata.archives[hyperfeed_story_id];

				if(ad.displayPosition == 'sidebar')
					FbAdCheck.parseSidebarAd(ad)
				else if(ad.displayPosition == 'timeline')
					FbAdCheck.parseTimelineAdSafe(ad)
			});
			// Synchronise with DB
			if(!test) FbAdCheck.save(WTMdata.newAds);
		});
	}

	// Lets keep things nice and granular, and avoid spaghetti.
	// This function identifies adverts, and collects their relevant HTML for future parsing.
	FbAdCheck.getAds = function (cb) {
		WTMdata.newAds = new Set();

		// Timeline adverts
		$("a:contains('Sponsored')").each(function(index) {
			// ## Start by specifying specific, reliable elements for examination
			var ad = {
				displayPosition: 'timeline',
				$initial: $(this),
				// This is the root timeline box that the advert appears in
				// but the specific ad content may be nested inside, e.g. [friends [advert]]
				// We can't trust that finding elements from this high up will get us the right stuff
				$timelineContainer: $(this).closest('[data-testid="fbfeed_story"]'),

				// This is the whole advert box, with comments/likes/shares etc.
				// Finding from here, especially meta-data like the above
				$adContent: $(this).closest('.fbUserContent'),

				// No user data, except MAYBE 'X was also interested in this event'
				// This is the one to store
				$advertNoUI: $(this).closest('.fbUserContent > div:first-child'),

				// Advertising entity
				$entity: $(this).parent()
					.closest('.clearfix') // The right-floating Name/Sponsored/Headline of the advert
					.find('a')
					.filter(function() { return $(this).text().length > 0 }) // i.e. not the profile image
					.first(), // e.g. "International Students House at International Students House"
					// only the bit before the 'at', not *all* the anchor link text concatenated
			};

			ad.hyperfeed_story_id = ad.$timelineContainer.attr('id');
			FbAdCheck.registerInArchive(ad, WTMdata)
		});

		// Sidebar adverts
		$('.ego_section .ego_unit').each(function(index) {
			var ad = {
				displayPosition: 'sidebar',
				// the sidebar has the format .ego_section > .ego_unit_container > .ego_unit
				// as far as I can tell, all of the advert is contained in 'ego_unit'
				$initial: $(this),
				$adContainer: $(this),
				$adContent: $(this),
				$advertNoUI: $(this)
			}

			// this is not strictly a 'hyperfeed_story_id', but it does uniquely identify
			// the advert; I'll stick with the naming convention for feed ads.
			ad.hyperfeed_story_id = ad.$adContainer.children('div').first().attr('id')
			FbAdCheck.registerInArchive(ad, WTMdata)
		})

		cb();
	}

	FbAdCheck.registerInArchive = function(ad, WTMdata) {
		// Check if this advert has been previously dealt with, to prevent duplication
		if(typeof ad.hyperfeed_story_id !== 'undefined'
			&& !WTMdata.oldAds.has(ad.hyperfeed_story_id)
			&& !WTMdata.newAds.has(ad.hyperfeed_story_id)
		) {
			// Note this as a new, unique ad instance
			WTMdata.newAds.add(ad.hyperfeed_story_id);
			WTMdata.archives[ad.hyperfeed_story_id] = ad;
			config.devlog("New advert instance identified: "+ad.hyperfeed_story_id)
		}
	}

	FbAdCheck.parseSidebarAd = function (ad) {
		// sidebar ads are much less complex than timeline ads, and so there is much less
		// information we can collect about them

		var postType = [];
		if(ad.$adContent.find('a').length > 2) {
			// if the ad has split images, it uses different HTML structure, so you won't get the name/text the same as with simple ads
			postType.push('multiimg')
			var headline = ad.$adContent.find('a').eq(3).find('div > div:first-child').text();
			var entity = ad.$adContent.find('a').eq(3).find('div > div:last-child').text();  // facebook-defined: the display URL
			var subtitle = ad.$adContent.find('a').eq(4).text();
		} else {
			postType.push('singleimg')
			var headline = ad.$adContent.find('div > div > a > div > div > div').eq(1).text();
			var entity = ad.$initial.find('div > div > a > div > div > div').eq(2).text();
			var subtitle = ad.$adContent.find('div > div > a > div > div > div > span').text();
		}

		if(!headline && !entity && !subtitle) {
			config.devlog("Sidebar wasn't scanned properly (might be a FB UI refresh issue).");
			WTMdata.newAds.delete(ad.hyperfeed_story_id);
			return false;
		}

		var links = new Set();
		var anchors = [];
		anchors = ad.$adContent.find('a').toArray();
		if(anchors.length) {
			anchors.forEach(function(link) {
				var url = parseFBlink($(link).attr('href'));
				links.add(url);
			});
		}
		links = Array.from(links);

		// Sometimes there are dual-image adverts
		var images = ad.$adContainer.find('img').map(function() { return $(this).attr('src') }).toArray();

		ad.snapshot = {
			displayPosition: ad.displayPosition,
			post_type: postType,
			entity: entity,
			entityId: ad.$adContent.attr('data-ego-fbid'), // this seems to be consistent for the same advertiser, but it's not a facebook profile
			hyperfeed_story_id: ad.hyperfeed_story_id,

			// we don't have a way of knowing when the ad was created (unlike posts, which have a 'data-timestamp' attribute)
			timestamp_created: undefined,
			timestamp_snapshot: (Date.now() / 1000).toFixed(),

			// Sometimes there are dual-image adverts
			imageURL: ad.$adContainer.find('img').map(function() { return $(this).attr('src') }).toArray(),
			linkTo: links,

			headline: headline,
			subtitle: subtitle,

			// someone should confirm that are not collecting any user data here.
			// as far as I can tell, no user data is ever contained in the sidebar ads
			// so this operation should be safe.
			html: ad.$advertNoUI.html()
		}
	}

	FbAdCheck.parseTimelineAdSafe = function(ad) {
		try {
			FbAdCheck.parseTimelineAd(ad)
		} catch(e) {
			console.log("caught:", e)
			ad.snapshot = {
				displayPosition: ad.displayPosition,
				hyperfeed_story_id: ad.hyperfeed_story_id,
				exception: e
			}
			//$('<div></div>').html(ad.$advertNoUI.html())
			ad.snapshot.html = $('<div></div>');
			ad.snapshot.html.html(ad.$advertNoUI.html());
			ad.snapshot.html = ad.snapshot.html.html();
			console.log(ad)
		}
	}

	FbAdCheck.parseTimelineAd = function(ad) {
		/* -- Get postType -- */
		// A WTM project property, interpreted by how the ad looks/functions
		// TO DO: more granular/varied advert types
			// "page"
			// "interactive" (like some uni popup ads)
			// "message_cta"
		postType = []; // Posts could be a video linking to an event, tbf...
		if(ad.$adContent.find('video').length > 0)
			postType.push("video") // confirmed, working
		if(ad.$adContent.find('a[ajaxify^="/events/"]').length > 0)
			postType.push("fbevent") // renamed from 'event' to differentiate from faulty data
		if(ad.$adContent.find('[data-testid="multishare_pager_prev"],[data-testid="multishare_pager_next"]').length > 0)
			postType.push("multishare") // carousel of multiple mini-image/links
		if(ad.$adContent.find('.userContent').length < 1)
			postType.push("page")

	/* -- Get image/video thumbnail URL -- */
		var thumbnailMedia = []
		if(postType.includes('video'))
			thumbnailMedia.push(ad.$adContent.find('video').attr('src'));
		if(ad.$adContent.find('img.scaledImageFitWidth')) // most posts will just have an image
			thumbnailMedia.push(ad.$adContent.find('img.scaledImageFitWidth').attr('src'));
		if(postType.includes('multishare')) { // That carousel thingy
			ad.$adContent.find('ul li').map(function() {
				var item = {
					image: $(this).find('img').attr('src'),
					text: $(this).text(), // multishare text (probably includes button...)
					button: $(this).find('[role="button"]').text(), // multishare button
					link: parseFBlink($(this).find('[role="button"]').first().attr('href')) // multishare button
				}
				// ... so remove the button wording from the beginning
				if(item.button && item.text) item.text = item.text.replace(new RegExp("^"+item.button),'');
			  	thumbnailMedia.push(item);
			});
		}
		if(postType.includes('page')) // Just has a different structure, unfortunately...
			thumbnailMedia.push(ad.$adContent.find("._5ypk._5pbu img").attr('src'));
		// Remove empty values from 0 searches
		thumbnailMedia = thumbnailMedia.filter(function(e){return e});

	/* -- Get advert link-out -- */
		// We have to do all sorts of weird shit because Facebook sometimes obfuscates the URLs behind linkshim magic. It's horrible... but it works.
		// When we come to analyse these URLs, we're going to have to ignore the last parts with all the random (likely UID) strings at the end.
		// We're using a set so we don't end up with tonnes of identical links
		// We could go further, removing the query params at the end of URLs, but I have no idea what they are most of the time and I'd rather not miss out on potentially interesting data later on. Leave URL refining to later analysis.
		var links = new Set();
		var anchors = [];
		// Turns out, `page`-type ads don't have links. Just a button to like the page, hah.
		/* a warning to ye */ // if(postType.includes('page')) anchors.concat(ad.$adContent.find("._5ypk._5pbu a").toArray());
		anchors = ad.$adContent.find('.userContent + * a').toArray();
		if(anchors.length) {
			anchors.forEach(function(link) {
				var url = parseFBlink($(link).attr('href'));
				links.add(url);
			});
		}
		links = Array.from(links);

	/* -- What to save to the server -- */
		// This needs to be purged of all user data.
		ad.snapshot = {
			displayPosition: ad.displayPosition,
			// Clearfix is the right-floating Name/Sponsored/Headline of the advert.
			// We only want the :first-of-type, because
			//	e.g. "International Students House at International Students House"
			// 	we only want the bit before the 'at', not *all* the anchor link text concatenated.
			entity: ad.$entity.text(),
			entityID: ad.$entity.attr('data-hovercard-obj-id'),
			entity_vanity: ad.$entity.attr('href').split(/\/\?|\?/)[0].split('https://www.facebook.com/')[1],

			// Unique to the advert
			top_level_post_id: /\[top_level_post_id\]=([0-9]+)/.exec(ad.$entity.attr('href'))
				? /\[top_level_post_id\]=([0-9]+)/.exec(ad.$entity.attr('href'))[1] // it's important to have the below, because there are odd cases where one or the other works
				: ad.$adContent.find('input[name="ft_ent_identifier"]').first().attr('value'), // `ft_ent_identifier` is an alias, in comment sys + 'saved links' page
			mf_story_key: /\[mf_story_key\]=([0-9]+)/.exec(ad.$entity.attr('href')) ? /\[mf_story_key\]=([0-9]+)/.exec(ad.$entity.attr('href'))[1] : null,
			hyperfeed_story_id: ad.hyperfeed_story_id,

			// Timestamps
			timestamp_created: ad.$adContent.closest('[data-timestamp]').attr('data-timestamp'),
			timestamp_snapshot: ad.$adContent.attr('WTM_timestamp_snapshot') || (Date.now() / 1000).toFixed(),

			post_type: postType,
			thumbnailMedia: thumbnailMedia,
			linkTo: links,
			postText: ad.$adContent.find('.userContent,._5ypk._5pbu').text(), // latter selector is for page ads

			// Different selectors for image, video
			fbStory_headline: ad.$adContent.find('.mbs._6m6._2cnj._5s6c, ._275z._5s6c').text(),
			fbStory_subtitle: ad.$adContent.find('._6m7._3bt9, ._5q4r').text(),

			// Weird and whacky formats that I try and interpret with parseFBnumber
			// 1 1000 1,000 1k 5M etc.
			// NB: These may not work right on static HTML, because Facebook JS stuffs
			comments: parseFBnumber(ad.$adContent.find('[data-intl-translation^="{count} Comment"]').first().text().replace(/ Comments?/,"")),
			shares: parseFBnumber(ad.$adContent.find('[data-intl-translation^="{count} Share"]').first().text().replace(/ Shares?/,"")),
			views: parseFBnumber(ad.$adContent.find('[data-intl-translation^="{count} Views"]').first().text().replace(/ Views?/,"")),
			reactions: parseFBnumber(ad.$adContent.find('[aria-label="See who reacted to this"] + [href^="/ufi/reaction"] [data-tooltip-uri]').first().text())
		}

	/* -- Specific reactions -- */
		// We get the sum of all reactions above.
		// NB: These may not work right on static HTML, because Facebook JS stuffs
		var reactionTypes = ['Like','Love','Wow','Sad','Haha','Angry'];
		reactionTypes.forEach(function(reaction) {
			reactionCount = ad.$adContent.find(`[aria-label$="${reaction}"]`).text();
			reactionCount = parseFBnumber(reactionCount);
			ad.snapshot["reactions"+reaction] = reactionCount;
		});

	/* -- Triple check no user data -- */
		// Manipulate our copy of the HTML, not the actual DOM
		ad.snapshot.html = $('<div></div>');
		ad.snapshot.html.html(ad.$advertNoUI.html());
		// E.g. X Y and 10 others like [this|name of advertiser].
		ad.snapshot.html.find(`
			h5:contains('likes this.'),
			h5:contains('like this.'),
			h5:contains('likes ${ad.snapshot.entity}.'),
			h5:contains('like ${ad.snapshot.entity}.'),
			h5:contains('are going to this event.'),
			h5:contains('is going to this event.'),
			h5:contains('are interested in this event.'),
			h5:contains('is interested in this event.')
		`).remove();
		ad.snapshot.html = ad.snapshot.html.html();
	}

	/* =====
		Syncing things, not applicable to the core, testable stuff.
	*/
	FbAdCheck.save = function(newAds) {
		if(test || newAds.size < 1) return false;
		// config.devlog(`Sync'ing ads just found `,newAds);

		newAds.forEach(function(hyperfeed_story_id, index) {
			var snapshot = WTMdata.archives[hyperfeed_story_id].snapshot;

			// Save the whole shabang to server
			config.devlog("Archiving new ad:",snapshot.entity, snapshot.hyperfeed_story_id, snapshot);

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
					config.devlog("This new ad [SERVER SYNC'D] Advert ID: "+(snapshot.hyperfeed_story_id))
					WTMdata.oldAds.add(hyperfeed_story_id);
				}).fail(function(data) {
					config.devlog(data.status);
					config.devlog("Error saving this ad, backing up for later server save, Advert ID: "+(snapshot.hyperfeed_story_id));
					browserStorage.add('notServerSavedAds',snapshot);
				});
			} else {
				config.devlog("Backing up for server save, once access_token is received");
				browserStorage.add('notServerSavedAds',snapshot);
			}
		})
	}

	if(!test) {
		// Collect basic targeting data across user's devices
		userStorage = new ChromeStorage({
			access_token: null,
			dateTokenGot: null
		}, "sync")

		// Maintain a record of advert archives on this device
		browserStorage = new ChromeStorage({
			notServerSavedAds: []
		}, "local")
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

	function parseFBnumber(str) {
		if(!str || typeof str != 'string' || str == '') return null;

		str = str.trim().replace(/,/g, '');

		if(str.endsWith("k")) {
			str = parseFloat(str.slice(0,-1));
			str *= 1000;
		} else if(str.endsWith("M")) {
			str = parseFloat(str.slice(0,-1));
			str *= 1000000;
		}
		return parseInt(str);
	}

	function parseFBlink(url) {
		if(!url || typeof url != 'string' || url == '')
			return config.devlog("Non-string URL",url);

		return url.includes("l.facebook.com/l.php?") ? (
					getParameterByName('u',url).includes("http") ?
						getParameterByName('u',url) : decodeURIComponent(url)
						) : decodeURIComponent(url)

		//https://www.abeautifulsite.net/parsing-urls-in-javascript
	}
}
