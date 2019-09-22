const margin4 = { top: 30, right: 20, bottom: 80, left: 60 },
  width4 = 1270 - margin4.left - margin4.right,
  height4 = 350 - margin4.top - margin4.bottom;

let amountofships = 20;

const x4 = d3.scale.ordinal().rangeRoundBands([0, width4], 0.05);
const y4 = d3.scale.linear().range([height4, 0]);

const xAxis4 = d3.svg
  .axis()
  .scale(x4)
  .orient("bottom");

const yAxis4 = d3.svg
  .axis()
  .scale(y4)
  .orient("left")
  .ticks(10);

const tip4 = d3
  .tip()
  .attr("class", "d3-tip")
  .offset([-10, 0])
  .html(function(d) {
    return d.value + " works";
  });

const svg4 = d3
  .select("#shipgraph")
  .append("svg")
  .attr("width", width4 + margin4.left + margin4.right)
  .attr("height", height4 + margin4.top + margin4.bottom)
  .append("g")
  .attr("transform", "translate(" + margin4.left + "," + margin4.top + ")");

svg4.call(tip4);

d3.csv("../data/dragonageships.csv", function(error, data4) {
  data4 = data4.slice(0, amountofships);

  data4.forEach(function(d) {
    d.value = +d.value;
  });

  x4.domain(
    data4.map(function(d) {
      return d.key;
    })
  );
  y4.domain([
    0,
    d3.max(data4, function(d) {
      return d.value;
    })
  ]);

  svg4
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height4 + ")")
    .call(xAxis4)
    .selectAll("text")
    .call(wrap, x4.rangeBand());

  svg4
    .append("g")
    .attr("class", "y axis")
    .call(yAxis4)
    .append("text")
    .attr("y", -10)
    .attr("x", -7)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("font-weight", "bold")
    .text("Works");

  svg4
    .selectAll(".bar")
    .data(data4)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function(d) {
      return x4(d.key);
    })
    .attr("width", x4.rangeBand() - 3)
    .attr("y", function(d) {
      return y4(d.value);
    })
    .attr("height", function(d) {
      return height4 - y4(d.value);
    })
    .on("mouseover", tip4.show)
    .on("mouseout", tip4.hide);

  function wrap(text, width4) {
    text.each(function() {
      let text = d3.select(this),
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
        if (tspan.node().getComputedTextLength() > width4) {
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
