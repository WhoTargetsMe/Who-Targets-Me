var advertisers = [];
var timestamp = Math.floor(Date.now());

Array.prototype.diff = function(a) { // Polyfill diff function
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

$(document).ready(function() {
  window.setInterval(function(){
    var updated_advertisers = []
    $("a:contains('Sponsored')").each(function(index) {
      var temp_advert = $(this).closest('div').prev().find('a').text();
      if(temp_advert) {
        updated_advertisers.push(temp_advert);
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
    console.log("Data saved")
  });
}
