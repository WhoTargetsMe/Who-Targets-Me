var advertisers = [];
var storedPostIDs = []; // Retrieve from server, all post IDs (i.e. adverts) snapshotted
var timestamp = Math.floor(Date.now());
var archivedAttr = 'wtm-archived';

Array.prototype.diff = function(a) { // Polyfill diff function
	return this.filter(function(i) {return a.indexOf(i) < 0;});
};

$(document).ready(function() {
	window.setInterval(function(){
		var updated_advertisers = []
		$("a:contains('Sponsored')").each(function(index) {
			var sponsorHTML = $(this).closest('div').prev().find('a:first-of-type');
			var sponsorName = sponsorHTML.text();
			/*
			`sponsorHTML` sample html, from which to find [`top_level_post_id`] (in this case, 1228218533893902)
			<a href="https://www.facebook.com/getintoteaching/?hc_ref=ADS&amp;fref=nf&amp;ft[tn]=kC&amp;ft[qid]=6412371648924163418&amp;ft[mf_story_key]=3962249031861160198&amp;ft[ei]=AI%40182b18588aea4bc4d7d508ccbed8305d&amp;ft[top_level_post_id]=1228218533893902&amp;ft[fbfeed_location]=1&amp;ft[insertion_position]=59&amp;__md__=0" data-hovercard="/ajax/hovercard/page.php?id=149145438467889&amp;extragetparams=%7B%22hc_ref%22%3A%22ADS%22%2C%22fref%22%3A%22nf%22%7D" data-hovercard-prefer-more-content-show="1" data-hovercard-obj-id="149145438467889" onmousedown="this.href = this.href.replace('__md__=0', '__md__=1');">Get Into Teaching</a>
			*/
			var postID = /\[top_level_post_id\]=([0-9]+)/.exec(sponsorHTML.attr('href'));

			if(sponsorName && postID != null && postID.constructor === Array) {
				postID = postID[1];
				updated_advertisers.push(sponsorName);
				var adContent = $(this).closest('div').prev().find('a:first-of-type').closest('.fbUserContent');

				// Store new adverts to DB
				if(storedPostIDs.includes(postID) == false) {
					html2canvas(adContent, {
						onrendered: function(canvas) {
							// Awaiting server-side DB compatibility
							// $.post("https://who-targets-me.herokuapp.com/analytics/", {
							// 	image: canvas.toDataURL("image/png"),
							// 	html: adContent.html(),
							// 	timestampe: adContent.closest('[data-timestamp]').attr('data-timestamp'),
							// 	postID: postID
							// }, function( data ) {
								console.log("[ARCHIVING COMPLETE] Advertiser: "+sponsorName+" - Post ID: "+postID);
								storedPostIDs.push(postID); // now update server, too.
								console.log(storedPostIDs);
							// });
						}
					});
				} else {
					console.log("[ALREADY ARCHIVED] Advertiser: "+sponsorName+" - Post ID: "+postID);
				}
			}
		})
		if(updated_advertisers.length !== advertisers.length) {
			var new_advertisers = updated_advertisers.diff(advertisers)
			new_advertisers.map(function(advert, index) {
				$.post("https://who-targets-me.herokuapp.com/analytics/", {entity: advert}, function( data ) {
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
