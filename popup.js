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
	$.ajax({
		type: 'get',
		// url: "http://192.168.1.198:8001/analytics/",
		url: "http://127.0.0.1:8001/analytics/",
		// url: "https://who-targets-me.herokuapp.com/analytics/",
		dataType: 'json',
		headers: {"Access-Token": userStorage.access_token},
		success: function(res) {
				req_success(res);
			}
	});
}


function show_user_demographics() {
	age_range = "0-100";
	constituency = "Unknown";

	if (userStorage.age < 30) {
		age_range = "< 30";
	} else if (userStorage.age < 40) {
		age_range = "< 30-40";
	} else if (userStorage.age < 50) {
		age_range = "< 40-50";
	} else if (userStorage.age < 60) {
		age_range = "< 50-60";
	} else if (userStorage.age < 70) {
		age_range = "< 60-70";
	} else {
		age_range = "80+";
	}

	$('#demographic').text("As a " + age_range + " year old " + userStorage.gender + ", voting in " + constituency + ":");
}


function process_data(data) {
	ad_count = 0;

	default_parties = {
					"Conservatives": true,
					"Labour": true,
					"Liberal Democrats": true,
					"UKIP": true
				};

	$.each(data.breakdown, function (idx, ad_data) {
			if (default_parties.hasOwnProperty(ad_data.party)) {
				delete default_parties[ad_data.party];
			}

			ad_count += ad_data.count;
		});
	$.each(data.breakdown, function (idx, ad_data) {
			ad_data.percent = ((ad_data.count / ad_count) * 100).toFixed(1);
		});
	data.percent = ((ad_count / data.total) * 100).toFixed(1);

	data.cost = ((ad_count * data.ad_cost) / 100).toFixed(2);

	// Add any of the default parties that not present in the server data.
	for (var key in default_parties) {
		data.breakdown.push({"party": key, "count": 0, "percent": 0});
	}

	// TODO: Sort the party data so it always appears in a consistent order.
}


function show_user_ad_info(data) {
	$('#ad-percentage').text(data.percent + "%");
	$('#ad-cost').html('&pound;' + data.cost);

	$('#ad-summary').text("(Based on seeing " + data.total + " ads, of which " + ad_count + " were political)");
}


function show_user_analytics() {
	get_user_analytics_data(function(err) {
			console.log(err);

			// TODO: Do something with this later.
		},
		function(data) {
			process_data(data);

			show_user_demographics();
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
