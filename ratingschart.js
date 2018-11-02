const width5 = 1200, //width
  height5 = 300, //height
  radius = Math.min(width5, height5) / 2; //radius

var color = d3.scale
  .ordinal()
  .range(["#213845", "#33696E", "#A6E2B7", "#FEEB97", "#D96412"]);

var arc = d3.svg
  .arc()
  .outerRadius(radius - 10)
  .innerRadius(0);

var pie = d3.layout.pie().value(function(d) {
  return d.value;
});

var svg5 = d3
  .select("#ratingsgraph")
  .append("svg")
  .attr("width", width5)
  .attr("height", height5)
  .append("g")
  .attr("transform", "translate(" + width5 / 2 + "," + height5 / 2 + ")");

d3.csv("dragonageratings.csv", function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
    d.key = d.key;
    d.value = +d.value;
  });
  var g = svg5
    .selectAll(".arc")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc");

  g.append("path")
    .attr("d", arc)
    .style("fill", function(d) {
      return color(d.data.key);
    })
    .on("mouseover", function(d) {
      d3.select(this).style("fill", d3.rgb(color(d.data.key)).brighter(1));
    })
    .on("mouseout", function(d) {
      d3.select(this).style("fill", color(d.data.key));
    });

  g.append("text")
    .attr("transform", function(d) {
      return "translate(" + arc.centroid(d) + ")";
    })
    .attr("dy", ".35em")
    .style("text-anchor", "middle")
    .text(function(d) {
      return d.data.key + "(" + d.data.value + ")";
    });
});
