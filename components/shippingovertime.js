const parseShippingDate = d3.time.format("%b %Y").parse,
  bisectShippingDate = d3.bisector(function (d) {
    return d.date;
  }).left;

const xAxisShipTime = d3.svg
  .axis()
  .scale(x)
  .orient("bottom");

const yAxisShipTime = d3.svg
  .axis()
  .scale(y)
  .orient("left");

const svgShipTime = d3
  .select("#shipcomparisongraph")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("./data/haikyuu/kagehina_months.json", function (error, data) {
  if (error) throw error;

  data.forEach(function (d) {
    d.date = parseShippingDate(d.date);
    d.value = +d.value;
  });

  data.sort(function (a, b) {
    return a.date - b.date;
  });

  d3.json("./data/haikyuu/iwaoi_months.json", function (error, data_iwaoi) {
    if (error) throw error;

    data_iwaoi.forEach(function (d) {
      d.date = parseShippingDate(d.date);
      d.value = +d.value;
    });

    data_iwaoi.sort(function (a, b) {
      return a.date - b.date;
    });


    d3.json("./data/haikyuu/sakuatsu_months.json", function (error, data_sakuatsu) {
      if (error) throw error;

      data_sakuatsu.forEach(function (d) {
        d.date = parseShippingDate(d.date);
        d.value = +d.value;
      });

      data_sakuatsu.sort(function (a, b) {
        return a.date - b.date;
      });

      x.domain([data[0].date, data[data.length - 1].date]);
      y.domain(
        d3.extent([].concat(data.map(d => d.value), data_sakuatsu.map(d => d.value), data_iwaoi.map(d => d.value)))
      );

      // Add the X Axis to the svg
      svgShipTime
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisShipTime)
        .append("text")
        .attr("text-anchor", "start")
        .attr("x", width - 120)
        .attr("y", -8)
        .text("Last updated");

      // Add the Y Axis to the svg
      svgShipTime
        .append("g")
        .attr("class", "y axis")
        .call(yAxisShipTime)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Works per month");

      svgShipTime
        .append("path")
        .datum(data_iwaoi)
        .attr("d", line)
        .attr("stroke", "#7cd9de")
        .attr("stroke-width", "2px")
        .attr("fill", "none");

      svgShipTime
        .append("path")
        .datum(data_sakuatsu)
        .attr("d", line)
        .attr("stroke", "#59594e")
        .attr("stroke-width", "2px")
        .attr("fill", "none");

      svgShipTime
        .append("path")
        .datum(data)
        .attr("d", line)
        .attr("stroke", "#ce7235")
        .attr("stroke-width", "2px")
        .attr("fill", "none");
    });
  });
});
