$(document).ready(function() {
  $.get("https://who-targets-me.herokuapp.com/analytics/", function(raw_response) {
    var response = $.parseJSON(raw_response)
    response.data.map(function(analytic, index) {
      $("tbody").append("<tr><td>" + analytic.entity + "</td><td>" + analytic.instances + "</td></tr>")
    })
  });
})
