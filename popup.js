var userStorage = new ChromeStorage({ // Collect basic targeting data across user's devices
	access_token: null
}, "sync")

$(document).ready(function() {
	$('body').on('click', 'a', function(){
		chrome.tabs.create({url: $(this).attr('href')});
		return false;
	});

	$("#createaccount").click(function() {
		isFormValid();
	});

	if(userStorage.access_token) {
		$("#signup").hide();
	}else {
		$("#results").hide();
	}

})

function isFormValid() {
	var age = $("#signup_age").val();
	var gender = $("input[name='signup_gender']:checked").val();
	var postcode = $("#signup_postcode").val();
	if(gender === 'male') {
		gender = 1;
	}else if(gender === 'female') {
		gender = 2;
	}else {
		gender = 0;
	}

	var request = {age, gender, postcode};
	$.post("https://who-targets-me.herokuapp.com/user/", request, function(response) {
		response = JSON.parse(response);

		if(response.data.access_token) {
			userStorage.set('access_token', response.data.access_token, function() {
				$("#results").show();
				$("#signup").hide();
			});
		}


//{"status":"success","data":{"access_token":"889f55f9269ae8c4187103c269a540c926485e28cebce487a23f40a257f402b7"}}
	});
}
