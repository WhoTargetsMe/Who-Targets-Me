var userStorage = new ChromeStorage({ // Collect basic targeting data across user's devices
	age: null,
	gender: null,
	postcode: null,
	access_token: null
}, "sync")

// Prefill if possible
userStorage.onLoad({
	age: () => $('#age').val(userStorage.age),
	postcode: () => $('#postcode').val(userStorage.postcode),
	gender: () => $('input#'+userStorage.gender).prop("checked", true)
})

$(document).ready(function() {
	$("#loading").hide();
	$("#finished").hide();

	$("#register").submit(function(event) {
		event.preventDefault();

		var $form = $("#register").get(0);
		if (!$form.checkValidity || $form.checkValidity()) {
			console.log("It's valid!");

			var values = {};
			$.each($('#register').serializeArray(), function(i, field) {
			    values[field.name] = field.value;
				userStorage.set([field.name], field.value.trim());
			});
			console.log(values);

			$("#register").hide();
			$("#loading").show();

			$.post("https://who-targets-me.herokuapp.com/user/", $('#register').serialize(), function(data) {
				console.log(data);
				var response = jQuery.parseJSON(data);
				userStorage.set('access_token', response.access_token, function() {
					console.log("User demographic data saved to server; token received.");
					$("#loading").hide();
					$("#finished").show();
				});
			});
		}
	})
})
