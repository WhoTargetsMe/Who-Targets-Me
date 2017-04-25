var response = null;

$(document).ready(function() {
	checkLoading();
	$.get("https://who-targets-me.herokuapp.com/analytics/", function(raw_response) {
		response = $.parseJSON(raw_response)
		response.data.map(function(analytic, index) {
			$("tbody").append("<tr><td>" + analytic.entity + "</td><td>" + analytic.instances + "</td></tr>");
		});
		checkLoading();
	});

	$('body').on('click', 'a', function(){
		chrome.tabs.create({url: $(this).attr('href')});
		return false;
	});
})

function checkLoading() {
	if (response == null) {
		$("#isLoading").show();
		$("#isFinished").hide();
	} else {
		$("#isLoading").hide();
		$("#isFinished").show();
	}
}
