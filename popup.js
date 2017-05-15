// Popup size fix
setTimeout(() => {
	const style = document.querySelector('#app').style;
	style.display = 'block';
	setTimeout(() => {
		style.opacity = 1;
	});
}, 200);
//

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

function start() {
	$(document).ready(function() {

		$('body').on('click', 'a', function(){
			chrome.tabs.create({url: $(this).attr('href')});
			return false;
		});

		$('#errors').hide();
		$("#loading").hide();

		if(userStorage.access_token) {
			$("#signup").hide();
			$("#loading").show();
			$("#results").hide();
			initResultsPage();
			// 	$('#data-not-ready').hide();
			// 	$('#data-ready').show();
			// if ((browserStorage.advertArchive) && (browserStorage.advertArchive.length > 10)) {
			// 	$('#data-not-ready').hide();
			// 	$('#data-ready').show();
			//
			// 	show_user_analytics();
			// }
		} else {
			$("#results").hide();

			$("#register").submit(function(event) {
				event.preventDefault();
				isFormValid()
			});
		}
	})
}



function initResultsPage() {
	$.ajax({
		type: 'get',
		url: config.APIURL+"/user/",
		headers: {"Access-Token": userStorage.access_token}
	}).done(function(response) {
		response = JSON.parse(response);
		$("#constituency_name").text(response.data.constituency.name);

		//Determine which share message to show the user
		if(response.data.constituency.users === 1) {
			$("#constituency_share").text("Congratulations! You're the first volunteer in your constituency. Can you help us find more?");
		}else if(response.data.constituency.users > 1) {
			$("#constituency_share").html("You're one of <b>" + response.data.constituency.users + "</b> volunteers in " + response.data.constituency.name + ", can you help us reach <b>" + roundUp(response.data.constituency.users) + "</b>?");
		}

		//Get all stats
		// $.each(response.data.all_top_advertisers, function(index, value) {
		// 	$("#all_advertisers_body").append("<tr><td class=\"pv1 bb b--black-20\">" + value.count + "</td><td class=\"pv1 bb b--black-20\"><img src=\"" + value.profile_photo + "\"/></td><td class=\"pv1 bb b--black-20\">" + value.advertiser + "</td></tr>")
		// });
		//
		// if(response.data.all_top_advertisers.length == 0) {
		// 	$("#all_advertisers_body").append("<tr><td class=\"pv1 bb b--black-20\" colspan=\"3\">Looks like we haven't detected any ads yet!</td></tr>")
		// }

		if(response.data.my_party_advertisers.length == 0) {
			$("#my_party_advertisers_table").append("<tr><td class=\"pv1 bb b--black-20\" colspan=\"3\">Looks like we haven't detected any ads yet! Patience is a virtue, just you wait until the last few weeks of the election...</td></tr>")
		}else {
			$.each(response.data.my_party_advertisers, function(index, value) {
				$("#my_party_advertisers_table").append("<tr><td class=\"pv1 bb b--black-20\">" + value.count + "</td><td class=\"pv1 bb b--black-20\"><img src=\"" + value.profile_photo + "\"/></td><td class=\"pv1 bb b--black-20\">" + value.advertiser + "</td></tr>")
			});
		}

		if(response.data.all_party_advertisers.length == 0) {
			$("#all_party_advertisers_table").append("<tr><td class=\"pv1 bb b--black-20\" colspan=\"3\">Looks like we haven't detected any ads yet!</td></tr>")
		}else {
			$.each(response.data.all_party_advertisers.results, function(index, value) {
				$("#all_party_advertisers_table").append("<tr><td class=\"pv1 bb b--black-20\">" + value.percentage + "</td><td class=\"pv1 bb b--black-20\"><img src=\"" + value.profile_photo + "\"/></td><td class=\"pv1 bb b--black-20\">" + value.name + "</td></tr>")
			});
		}

		$("#my_party_advertisers_adverts").text(response.data.all_party_advertisers.advert_count);
		$("#my_party_advertisers_users").text(response.data.all_party_advertisers.people_count);

		$("#loading").hide();
		$("#results").show();
	});
}



function isFormValid() {
	var request = {};
	$.each($('#register').serializeArray(), function(i, field) {
		request[field.name] = field.value;
		userStorage.set([field.name], field.value.trim());
	});
	console.log(request);

	if(!request.agree_terms || request.agree_terms != "yes") {
		$("#registration_errors").text("Please read and agree to the terms and conditions and privacy policy!")
		return
	}

	$("#signup").hide();
	$("#loading").show();

	$.post(config.APIURL+"/user/", request)
		.done(function(response) {
				response = JSON.parse(response);
				if(response.data.access_token) {
					userStorage.set('access_token', response.data.access_token, function() {
						userStorage.set('dateTokenGot', Date.now(), function() {
							chrome.extension.sendMessage({access_token_received: userStorage.dateTokenGot});
						});

						$("#loading").hide();
						initResultsPage();
					});
				}
		})
		.fail(function($xhr) {
			$("#signup").show();
			$("#loading").hide();
			error =  $.parseJSON($xhr.responseText);
			$("#registration_errors").text(error.reason);
		})
}



function get_user_analytics_data(req_failure, req_success) {
	$.ajax({
		type: 'get',
		// url: "http://192.168.1.198:8001/analytics/",
		url: "http://127.0.0.1:8001/analytics/",
		// url: config.APIURL+"/analytics/",
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

	gender = "";
	if (userStorage.gender !== undefined) {
		gender = userStorage.gender;
	}

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

	$('#demographic').text("As a " + age_range + " year old " + gender + ", voting in " + constituency + ":");
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

const roundUp = (x) => {
    if(x < 10) {
      return 10;
    }
    var y = Math.pow(10, x.toString().length-1);
    x = ((x+1)/y);
    x = Math.ceil(x);
    x = x*y;
    return x;
}
