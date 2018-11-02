var margin2 = { top: 30, right: 20, bottom: 80, left: 60 },
  width2 = 1270 - margin2.left - margin2.right,
  height2 = 350 - margin2.top - margin2.bottom;

var amountofchars = 20;

var x2 = d3.scale.ordinal().rangeRoundBands([0, width2], 0.05);

var y2 = d3.scale.linear().range([height2, 0]);

var xAxis2 = d3.svg
  .axis()
  .scale(x2)
  .orient("bottom");

var yAxis2 = d3.svg
  .axis()
  .scale(y2)
  .orient("left")
  .ticks(10);

var tip = d3
  .tip()
  .attr("class", "d3-tip")
  .offset([-10, 0])
  .html(function(d) {
    return d.value + " works";
  });

var svg2 = d3
  .select("#chargraph")
  .append("svg")
  .attr("width", width2 + margin2.left + margin2.right)
  .attr("height", height2 + margin2.top + margin2.bottom)
  .append("g")
  .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

svg2.call(tip);

d3.csv("dragonagechars.csv", function(error, data2) {
  data2 = data2.slice(0, amountofchars);

  data2.forEach(function(d) {
    d.value = +d.value;
  });

  x2.domain(
    data2.map(function(d) {
      return d.key;
    })
  );
  y2.domain([
    0,
    d3.max(data2, function(d) {
      return d.value;
    })
  ]);

  svg2
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis2)
    .selectAll("text")
    .call(wrap, x2.rangeBand());

  svg2
    .append("g")
    .attr("class", "y axis")
    .call(yAxis2)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Works");

  svg2
    .selectAll(".bar")
    .data(data2)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function(d) {
      return x2(d.key);
    })
    .attr("width", x2.rangeBand() - 3)
    .attr("y", function(d) {
      return y2(d.value);
    })
    .attr("height", function(d) {
      return height2 - y2(d.value);
    })
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);

  function wrap(text, width2) {
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
        if (tspan.node().getComputedTextLength() > width2) {
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
