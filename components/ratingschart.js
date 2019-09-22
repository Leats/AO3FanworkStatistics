var margin5 = { top: 30, right: 20, bottom: 80, left: 60 },
  width5 = 770 - margin5.left - margin5.right,
  height5 = 350 - margin5.top - margin5.bottom;

var amountofships = 20;

var x5 = d3.scale.ordinal().rangeRoundBands([0, width5], 0.05);

var y5 = d3.scale.linear().range([height5, 0]);

var xAxis5 = d3.svg
  .axis()
  .scale(x5)
  .orient("bottom");

var yAxis5 = d3.svg
  .axis()
  .scale(y5)
  .orient("left")
  .ticks(10);

var tip4 = d3
  .tip()
  .attr("class", "d3-tip")
  .offset([-10, 0])
  .html(function(d) {
    return d.value + " works";
  });

var svg5 = d3
  .select("#ratingsgraph")
  .append("svg")
  .attr("width", width5 + margin5.left + margin5.right)
  .attr("height", height5 + margin5.top + margin5.bottom)
  .append("g")
  .attr("transform", "translate(" + margin5.left + "," + margin5.top + ")");

svg5.call(tip4);

d3.csv("../data/dragonageratings.csv", function(error, data5) {
  data5 = data5.slice(0, amountofships);

  data5.forEach(function(d) {
    d.value = +d.value;
  });

  x5.domain(
    data5.map(function(d) {
      return d.key;
    })
  );
  y5.domain([
    0,
    d3.max(data5, function(d) {
      return d.value;
    })
  ]);

  svg5
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height5 + ")")
    .call(xAxis5)
    .selectAll("text")
    .call(wrap, x5.rangeBand());

  svg5
    .append("g")
    .attr("class", "y axis")
    .call(yAxis5)
    .append("text")
    .attr("y", -15)
    .attr("x", -7)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("font-weight", "bold")
    .text("Works");

  svg5
    .selectAll(".bar")
    .data(data5)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function(d) {
      return x5(d.key);
    })
    .attr("width", x5.rangeBand() - 3)
    .attr("y", function(d) {
      return y5(d.value);
    })
    .attr("height", function(d) {
      return height5 - y5(d.value);
    })
    .on("mouseover", tip4.show)
    .on("mouseout", tip4.hide);

  function wrap(text, width5) {
    text.each(function() {
      var text = d3.select(this),
        words = text
          .text()
          .split(/\s+/)
          .reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", dy + "em");
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width5) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", 0)
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word);
        }
      }
    });
  }
});
