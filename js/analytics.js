'use strict';


function get_user_analytics_data(req_failure, req_success) {
    $.ajax({
        type: 'get',
        url: "http://127.0.0.1:8001/analytics/",
        dataType: 'json',
        headers: {"Access-Token": userStorage.access_token},
        success: function(res) {
                req_success(res);
            }
    });
}


function show_user_demographics() {
    $.ajax({
        type: 'get',
        url: "http://127.0.0.1:8001/user/",
        dataType: 'json',
        headers: {"Access-Token": userStorage.access_token},
        success: function(res) {
                if (res.status === "success") {
                    var gender = "person";
                    if (res.data.demographics.gender === 1) {
                        gender = "male";
                    } else if (res.data.demographics.gender === 2) {
                        gender = "female";
                    }

                    var age_range = "";
                    if (res.data.demographics.age < 30) {
                        age_range = "< 30";
                    } else if (res.data.demographics.age < 40) {
                        age_range = "30-40";
                    } else if (res.data.demographics.age < 50) {
                        age_range = "40-50";
                    } else if (res.data.demographics.age < 60) {
                        age_range = "50-60";
                    } else if (res.data.demographics.age < 70) {
                        age_range = "60-70";
                    } else {
                        age_range = "80+";
                    }

                    $('#demographic').text("As a " + age_range + " year old " + gender + ", voting in " + res.data.constituency.name + ":");
                }
        }
    });
}


function process_data(data) {
    data.ad_count = 0;

    var default_parties = {
                    "Conservatives": true,
                    "Labour": true,
                    "Liberal Democrats": true,
                    "UKIP": true
                };

    $.each(data.breakdown, function (idx, ad_data) {
            if (default_parties.hasOwnProperty(ad_data.party)) {
                delete default_parties[ad_data.party];
            }

            data.ad_count += ad_data.count;
        });
    $.each(data.breakdown, function (idx, ad_data) {
            ad_data.percent = ((ad_data.count / data.ad_count) * 100).toFixed(1);
        });
    data.percent = ((data.ad_count / data.total) * 100).toFixed(1);

    data.cost = ((data.ad_count * data.ad_cost) / 100).toFixed(2);

    // Add any of the default parties that not present in the server data.
    for (var key in default_parties) {
        data.breakdown.push({"party": key, "count": 0, "percent": 0});
    }

    // TODO: Sort the party data so it always appears in a consistent order.
}


function show_user_ad_info(data) {
    $('#ad-percentage').text(data.percent + "%");
    $('#ad-cost').html('&pound;' + data.cost);

    $('#ad-summary').text("(Based on seeing " + data.total + " ads, of which " + data.ad_count + " were political)");
}


function show_user_analytics() {
    get_user_analytics_data(function(err) {
            console.log(err);

            // TODO: Do something with this later.
        },
        function(result) {
            process_data(result.data);

            show_user_demographics();
            show_user_ad_info(result.data);
            render_bar_chart(result.data.breakdown);
        });
}
