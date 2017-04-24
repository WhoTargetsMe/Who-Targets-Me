var advertisers = [];
var processingAdvertIDs = [];
var storedAdvertIDs = []; // Retrieve from server, all post IDs (i.e. adverts) snapshotted
var timestamp = Math.floor(Date.now());
var archivedAttr = 'wtm-archived';

Array.prototype.diff = function(a) { // Polyfill diff function
	return this.filter(function(i) {return a.indexOf(i) < 0;});
};

$(document).ready(function() {
	window.setInterval(function(){
		var updated_advertisers = []
		$("a:contains('Sponsored')").each(function(index) {
			var advertiserHTML = $(this).closest('div').prev().find('a:first-of-type');
			var advertiserName = advertiserHTML.text();
			/*
			`advertiserHTML` sample html, from which to find [`top_level_post_id`] (in this case, 1228218533893902)
			<a href="https://www.facebook.com/getintoteaching/?hc_ref=ADS&amp;fref=nf&amp;ft[tn]=kC&amp;ft[qid]=6412371648924163418&amp;ft[mf_story_key]=3962249031861160198&amp;ft[ei]=AI%40182b18588aea4bc4d7d508ccbed8305d&amp;ft[top_level_post_id]=1228218533893902&amp;ft[fbfeed_location]=1&amp;ft[insertion_position]=59&amp;__md__=0" data-hovercard="/ajax/hovercard/page.php?id=149145438467889&amp;extragetparams=%7B%22hc_ref%22%3A%22ADS%22%2C%22fref%22%3A%22nf%22%7D" data-hovercard-prefer-more-content-show="1" data-hovercard-obj-id="149145438467889" onmousedown="this.href = this.href.replace('__md__=0', '__md__=1');">Get Into Teaching</a>
			*/
			var advertID = /\[top_level_post_id\]=([0-9]+)/.exec(advertiserHTML.attr('href'));

			if(advertiserName && (
				(advertID != null && advertID.constructor === Array)
				/* try data-dedupekey or id=hyperfeed_story_id_... as alternative unique ID? */
			)) {
				advertID = advertID[1];
				updated_advertisers.push(advertiserName);
				var adContent = $(this).closest('div').prev().find('a:first-of-type').closest('.fbUserContent');

				// Store new adverts to DB
				if(!processingAdvertIDs.includes(advertID) && !storedAdvertIDs.includes(advertID)) {
					processingAdvertIDs.push(advertID);
					console.log(processingAdvertIDs);

					var snapshot = {
						entity: advertiserName,
						entityID: advertiserID,
						timestamp_created: adContent.closest('[data-timestamp]').attr('data-timestamp'),
						timestamp_snapshot: Date.now(),
						advertID: advertID,
						html: adContent.html(),
						rawtext: adContent.find('userContent').text()
					};

					// Image snapshot
					html2canvas(adContent, {
						onrendered: function(canvas) {
							snapshot.image = canvas.toDataURL("image/png")
							saveSnapshot();
						}
					});

					function saveSnapshot() {
						console.log("[ARCHIVING] Advertiser: "+advertiserName+" - Advert ID: "+advertID);
						// Requires server-side DB compatibility
						$.post("https://who-targets-me.herokuapp.com/analytics/", snapshot, function( data ) {
							console.log("[ARCHIVING COMPLETE] Advertiser: "+advertiserName+" - Advert ID: "+advertID);
							storedAdvertIDs.push(advertID); // now update server, too.
							console.log(storedAdvertIDs);
						});
					}
				} else {
					// console.log("[ALREADY ARCHIVED] Advertiser: "+advertiserName+" - Advert ID: "+advertID);
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

function updateAdvertDB(timestamp, data) {
	chrome.storage.sync.set({timestamp: data}, function() {
		console.log("Data saved");
	});
}
