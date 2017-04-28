'use strict';

var raw_data = {};

function show_data_flare(data) {
    var width = 960,
        height = 500,
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
    data.map(function(analytic, index) {
        $("tbody").append("<tr><td>" + analytic.entity + "</td><td>" + analytic.instances + "</td></tr>");
    });
}


$(document).ready(function() {
    checkLoading();

    $.get("https://who-targets-me.herokuapp.com/analytics/", function(raw_response) {
        response = $.parseJSON(raw_response);

        raw_data = response.data;

        show_table(raw_data);
        show_data_flare(raw_data);

        checkLoading();
    });
})
