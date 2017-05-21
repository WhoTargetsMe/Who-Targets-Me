$(document).ready(function() {
	var WTMtest = new Vue({
		el: "#app",
		data: {
			WTMdata: {
				oldAds: new Set(),
				newAds: new Set(),
				archives: {}
			}
		},
		computed: {
			debug: function() {
				// return this.advertsRecognised.length+" adverts recognised";
				return this.WTMdata
			},
			advertsRecognised: function() {
				return $(".fbUserContent");
			}
		},
		mounted: function() {
			// console.log(this.WhoTargetsMe.oldSnapshots)
			var WhoTargetsMe = new FbAdCheck(true,this.WTMdata);
			// WhoTargetsMe.watch(5000);
			WhoTargetsMe.scan();
		},
		filters: {
			prettify: function(value) {
				return JSON.stringify(value, null, 2);
			}
		}
	})
});
