function render_bar_chart(data) {
var svg = d3.select("#bar-chart"),
    margin = {top: 10, right: 10, bottom: 10, left: 120},
    width = + svg.attr("width") - margin.left - margin.right,
    height = + svg.attr("height") - margin.top - margin.bottom;

    var tooltip = d3.select("body").append("div").attr("class", "toolTip");

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleBand().range([height, 0]);

    var g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain([0, d3.max(data,
                        function(d) {
                            return d.count;
                        })
                ]);
    y.domain(data.map(function(d) { return d.party; })).padding(0.1);

    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
                .ticks(5)
                .tickFormat(function(d) {
                        return parseInt(d);
                    })
                .tickSizeInner([-height]));

    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    g.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", function(d, i) {
                return "bar " + d.party.replace(/\s/g, '').toLowerCase();
            })
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("y", function(d) {
                    return y(d.party);
                })
        .attr("width", function(d) {
                        return x(d.count);
                    })
        .on("mousemove", function(d){
            tooltip
              .style("left", d3.event.pageX - 50 + "px")
              .style("top", d3.event.pageY - 70 + "px")
              .style("display", "inline-block")
              .html((d.party) + "<br>" + (d.count) + " adverts");
        })
        .on("mouseout", function(d) {
                            tooltip.style("display", "none");
                        });

    g.selectAll(".text")
        .data(data)
        .enter().append("svg:text")
            .attr("class", "bartext")
            .attr("x", function(d) {
                return x(0);
            })
            .attr("y", function(d) {
                return y(d.party) + 40;
            })
            .text(function(d) {
                if (d.y0 === 0 && d.y === 0) {
                    return "";
                }
                else {
                    return ("" + d.percent + "%");
                }
            })
            .style("font", "10px")
            .attr("transform", "translate(5,-10)")
}
