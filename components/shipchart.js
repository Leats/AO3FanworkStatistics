const marginShip = { top: 30, right: 20, bottom: 80, left: 60 },
  widthShip = 1270 - marginShip.left - marginShip.right,
  heightShip = 350 - marginShip.top - marginShip.bottom;

let amountOfShips = 20;

const x4 = d3.scale.ordinal().rangeRoundBands([0, widthShip], 0.05);
const y4 = d3.scale.linear().range([heightShip, 0]);

const xAxisShip = d3.svg
  .axis()
  .scale(x4)
  .orient("bottom");

const yAxisShip = d3.svg
  .axis()
  .scale(y4)
  .orient("left")
  .ticks(10);

const tipShip = d3
  .tip()
  .attr("class", "d3-tip")
  .offset([-10, 0])
  .html(function (d) {
    return d.value + " works";
  });

const svgShip = d3
  .select("#shipgraph")
  .append("svg")
  .attr("width", widthShip + marginShip.left + marginShip.right)
  .attr("height", heightShip + marginShip.top + marginShip.bottom)
  .append("g")
  .attr("transform", "translate(" + marginShip.left + "," + marginShip.top + ")");

svgShip.call(tipShip);

d3.json("./data/haikyuu/ships.json", function (error, dataShip) {
  dataShip = dataShip.slice(0, amountOfShips);

  dataShip.forEach(function (d) {
    d.value = +d.value;
  });

  x4.domain(
    dataShip.map(function (d) {
      return d.ship;
    })
  );
  y4.domain([
    0,
    d3.max(dataShip, function (d) {
      return d.value;
    })
  ]);

  svgShip
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + heightShip + ")")
    .call(xAxisShip)
    .selectAll("text")
    .call(wrap, x4.rangeBand());

  svgShip
    .append("g")
    .attr("class", "y axis")
    .call(yAxisShip)
    .append("text")
    .attr("y", -5)
    .attr("x", -7)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("font-weight", "bold")
    .text("Works");

  svgShip
    .selectAll(".bar")
    .data(dataShip)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function (d) {
      return x4(d.ship);
    })
    .attr("width", x4.rangeBand() - 3)
    .attr("y", function (d) {
      return y4(d.value);
    })
    .attr("height", function (d) {
      return heightShip - y4(d.value);
    })
    .on("mouseover", tipShip.show)
    .on("mouseout", tipShip.hide);

  function wrap(text, widthShip) {
    text.each(function () {
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
        if (tspan.node().getComputedTextLength() > widthShip) {
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
