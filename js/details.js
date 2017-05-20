var browserStorage = null,
    userStorage = null;

function show_data_flare(data) {
    var width = 500,
        height = 400,
        radius = Math.min(width, height) / 2;

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var arc = d3.arc()
                .outerRadius(radius - 10)
                .innerRadius(0);

    var labelArc = d3.arc()
                    .outerRadius(radius - 40)
                    .innerRadius(radius - 40);

    var pie = d3.pie()
                .sort(null)
                .value(function(d) { return d.instances; });

    var svg = d3.select("#flare")
                    .attr("width", width)
                    .attr("height", height)
                .append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svg.selectAll(".arc")
                    .data(pie(data))
                .enter().append("g")
                    .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data.instances); });

    g.append("text")
        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .text(function(d) { return d.data.entity; });
}


function show_table(data) {
    data.map(function(advert, index) {
            $("#adverts").append("<tr><td>" + advert.entity + "</td><td>" + advert.instances + "</td></tr>");
        });
}


function show_details() {
    var items = {}, base, key;
    $.each(browserStorage.advertArchive, function(index, val) {
            key = val.entity;
            if (!items[key]) {
                items[key] = 0;
            }

            items[key] += 1;
        });

    var processedData = [];
    $.each(items, function(key, val) {
            processedData.push({entity: key, instances: val});
        });

    show_table(processedData);
    show_data_flare(processedData);

    $('#isLoading').hide();
}


$(document).ready(function() {
    $('#isLoading').show();

    browserStorage = new ChromeStorage({
            advertArchive: [],
        }, {
            api: "local",
            initCb: function() { show_details(); }
        });

    userStorage = new ChromeStorage({ // Collect basic targeting data across user's devices
            targetingHistory: [],
            access_token: null
        }, {
            api: "sync",
            initCb: function() { show_user_analytics(); }
        });
})
