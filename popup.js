var userStorage = new ChromeStorage({ // Collect basic targeting data across user's devices
	access_token: null,
	dateTokenGot: null
}, "sync")

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
