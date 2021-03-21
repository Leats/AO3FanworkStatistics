const margin = { top: 30, right: 20, bottom: 35, left: 50 },
  width = 1270 - margin.left - margin.right,
  height = 350 - margin.top - margin.bottom;

const parseDate = d3.time.format("%d %b %Y").parse,
  bisectDate = d3.bisector(function (d) {
    return d.date;
  }).left;

const x = d3.time.scale().range([0, width]);
const y = d3.scale.linear().range([height, 0]);

const xAxisTime = d3.svg
  .axis()
  .scale(x)
  .orient("bottom");

const yAxisTime = d3.svg
  .axis()
  .scale(y)
  .orient("left");

const line = d3.svg
  .line()
  .defined(function (d) { return d.value !== null && d.value !== 0; })
  .x(function (d) {
    return x(d.date);
  })
  .y(function (d) {
    return y(d.value);
  });

const svgTime = d3.select("#timesvg")
  .append("g")
  .attr("transform", "translate(" + 150 + "," + 270 + ")");

d3.json("./data/haikyuu/ficdates.json", function (error, data) {
  if (error) throw error;

  data.forEach(function (d) {
    d.date = parseDate(d.date);
    d.value = +d.value;
  });

  data.sort(function (a, b) {
    return a.date - b.date;
  });

  x.domain([data[0].date, data[data.length - 1].date]);
  y.domain(
    d3.extent(data, function (d) {
      return d.value;
    })
  );

  // Add the X Axis to the svg
  svgTime
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxisTime)
    .append("text")
    .attr("text-anchor", "start")
    .attr("x", width - 157)
    .attr("y", 32)
    .text("Last updated");

  // Add the Y Axis to the svg
  svgTime
    .append("g")
    .attr("class", "y axis")
    .call(yAxisTime)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Works per day");

  // add the lines for the date annotations
  d3.json("./data/haikyuu/importantdates.json", function (idates) {
    if (error) throw error;

    idates.forEach(function (i) {
      i.date = parseDate(i.date);
      i.value = i.value;
    });
    // Add the lines
    svgTime
      .selectAll("infolines")
      .data(idates)
      .enter()
      .append("line")
      .attr("x1", function (d) {
        return x(d.date);
      })
      .attr("y1", 0)
      .attr("x2", function (d) {
        return x(d.date);
      })
      .attr("y2", height)
      .style("stroke-width", 2)
      .style("stroke-opacity", 0.4)
      .style("stroke", "#222222")
      .style("fill", "none")
  });

  svgTime
    .append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line);
});
