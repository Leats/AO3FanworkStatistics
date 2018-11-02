var margin = { top: 30, right: 20, bottom: 35, left: 50 },
  width = 1270 - margin.left - margin.right,
  height = 350 - margin.top - margin.bottom;

var parseDate = d3.time.format("%d %b %Y").parse,
  bisectDate = d3.bisector(function(d) {
    return d.date;
  }).left,
  formatCurrency = function(d) {
    return d + " FFs";
  };

var x = d3.time.scale().range([0, width]);

var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg
  .axis()
  .scale(x)
  .orient("bottom");

var yAxis = d3.svg
  .axis()
  .scale(y)
  .orient("left");

var line = d3.svg
  .line()
  .x(function(d) {
    return x(d.date);
  })
  .y(function(d) {
    return y(d.value);
  });

var svg1 = d3
  .select("#timegraph")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("dragonagedates.csv", function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
    d.date = parseDate(d.date);
    d.value = +d.value;
  });

  data.sort(function(a, b) {
    return a.date - b.date;
  });

  x.domain([data[0].date, data[data.length - 1].date]);
  y.domain(
    d3.extent(data, function(d) {
      return d.value;
    })
  );

  // Add the X Axis
  svg1
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("text-anchor", "start")
    .attr("x", width - 140)
    .attr("y", 30)
    .style("font-weight", "bold")
    .text("Last time work was updated");

  // Add the Y Axis
  svg1
    .append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("font-weight", "bold")
    .text("Works per day");

  svg1
    .append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line);

  var focus = svg1
    .append("g")
    .attr("class", "focus")
    .style("display", "none");

  focus.append("circle").attr("r", 4.5);

  focus
    .append("text")
    .attr("x", 9)
    .attr("dy", ".35em");

  svg1
    .append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .on("mouseover", function() {
      focus.style("display", null);
    })
    .on("mouseout", function() {
      focus.style("display", "none");
    })
    .on("mousemove", mousemove);

  var tooltip = svg1
    .append("text")
    .style("position", "absolute")
    .style("font-size", "14px")
    .attr("x", "300")
    .attr("y", "20")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("A tooltip");

  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
      i = bisectDate(data, x0, 1),
      d0 = data[i - 1],
      d1 = data[i],
      d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    focus.attr("transform", "translate(" + x(d.date) + "," + y(d.value) + ")");
    focus.select("text").text(formatCurrency(d.value));
  }
  d3.csv("importantdates.csv", function(idates) {
    if (error) throw error;

    idates.forEach(function(i) {
      i.date = parseDate(i.date);
      i.value = i.value;
    });

    // Add the lines
    svg1
      .selectAll("dot")
      .data(idates)
      .enter()
      .append("line")
      .attr("x1", function(d) {
        return x(d.date);
      })
      .attr("y1", 0)
      .attr("x2", function(d) {
        return x(d.date);
      })
      .attr("y2", height)
      .style("stroke-width", 3)
      .style("stroke-opacity", 0.4)
      .style("stroke", "black")
      .style("fill", "none")
      .on("mouseover", function(d) {
        return tooltip.style("visibility", "visible").text(d.value);
      })
      .on("mouseout", function() {
        return tooltip.style("visibility", "hidden");
      });
  });
});
