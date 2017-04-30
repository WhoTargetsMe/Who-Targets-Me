var userStorage = new ChromeStorage({ // Collect basic targeting data across user's devices
	access_token: null,
	dateTokenGot: null
}, "sync")


var browserStorage = new ChromeStorage({ // Collect basic targeting data across user's devices
	advertArchive: [],
	notServerSavedAds: []
}, "local")


// Hide notification for access_token, if it has been set
chrome.extension.sendMessage({notification: "hide"});

// Can't access var until it's sync'd
userStorage.onLoad({ 'access_token': start() })


function get_user_analytics_data(req_failure, req_success) {
	console.log("Requesting analytics data.");
	$.ajax({
		type: 'get',
		url: "http://192.168.1.198:8001/analytics/",
		dataType: 'json',
		headers: {"Access-Token": userStorage.access_token},
		success: function(res) {
				req_success(res);
			}
	});

	// data = {
	// 		demographic: {
	// 				gender: "woman",
	// 				age_range: "64-75",
	// 				constituency: "Clacton"
	// 			},
	// 		ads: {
	// 				breakdown: [
	// 						{
	// 							party: "Conservatives",
	// 							count: 10
	// 						},
	// 						{
	// 							party: "Labour",
	// 							count: 7
	// 						},
	// 						{
	// 							party: "Liberal Democrats",
	// 							count: 2
	// 						},
	// 						{
	// 							party: "UKIP",
	// 							count: 4
	// 						}
	// 					],
	// 				total: 401,
	// 				ad_cost: 2,
	// 			}
	// 	};
	// success(data);
}


function show_user_demographics(data) {
	$('#demographic').text("As a " + data.gender + ", between " + data.age_range + ", voting in " + data.constituency + ":");
}


function show_user_ad_info(data) {
	ad_count = 0;

	// TODO: Make sure we add all of the default parties here if they are
	//       missing. At least then the bar chart is consistently displayed.

	$.each(data, function (idx, ad_data) {
			ad_count += ad_data.count;
		});
	$.each(data, function (idx, ad_data) {
			ad_data.percent = ((ad_data.count / ad_count) * 100).toFixed(1);
		});
	percent = ((ad_count / data.total) * 100).toFixed(1);

	cost = ((ad_count * data.ad_cost) / 100).toFixed(2);

	$('#ad-percentage').text(percent + "%");
	$('#ad-cost').html('&pound;' + cost);

	$('ad-summary').text("(Based on seeing " + data.total + " ads, of which " + ad_count + " were political)");
}


function show_user_analytics() {
	get_user_analytics_data(function(err) {
			console.log(err);

			// TODO: Do something with this later.
		},
		function(data) {
			// show_user_demographics(data.demographic);
			show_user_ad_info(data);
			render_bar_chart(data.breakdown);
		});
}


function start() {
	$(document).ready(function() {

		$('body').on('click', 'a', function(){
			chrome.tabs.create({url: $(this).attr('href')});
			return false;
		});

		$('#errors').hide();
		$("#loading").hide();

		$('#data-not-ready').show();
		$('#data-ready').hide();

		if(userStorage.access_token) {
			$("#signup").hide();

			if ((browserStorage.advertArchive) && (browserStorage.advertArchive.length > 10)) {
				$('#data-not-ready').hide();
				$('#data-ready').show();

				show_user_analytics();
			}
		} else {
			$("#results").hide();

			$("#register").submit(function(event) {
				event.preventDefault();

				var $form = $("#register").get(0);
				if (!$form.checkValidity || $form.checkValidity()) {
					console.log("It's valid!");
					isFormValid();
					$('#errors').hide();
				} else {
					$('#errors').show();
				}
			});
		}
	})
}

function isFormValid() {
	var request = {};
	$.each($('#register').serializeArray(), function(i, field) {
		request[field.name] = field.value;
		userStorage.set([field.name], field.value.trim());
	});
	console.log(request);

	$("#signup").hide();
	$("#loading").show();

	$.post("https://who-targets-me.herokuapp.com/user/", request, function(response) {
		response = JSON.parse(response);

		if(response.data.access_token) {
			userStorage.set('access_token', response.data.access_token, function() {
				userStorage.set('dateTokenGot', Date.now(), function() {
					chrome.extension.sendMessage({access_token_received: userStorage.dateTokenGot});
				});

				$("#loading").hide();
				$("#results").show();
			});
		}
	});
}
