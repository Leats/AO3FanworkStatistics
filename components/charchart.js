// define size of graphic
const marginChar = { top: 30, right: 20, bottom: 80, left: 60 },
  widthChar = 1270 - marginChar.left - marginChar.right,
  heightChar = 350 - marginChar.top - marginChar.bottom;

// set number of characters displayed
const amountOfChars = 20;

const xChars = d3.scale.ordinal().rangeRoundBands([0, widthChar], 0.05);
const yChars = d3.scale.linear().range([heightChar, 0]);

const xAxisChars = d3.svg
  .axis()
  .scale(xChars)
  .orient("bottom");

const yAxisChars = d3.svg
  .axis()
  .scale(yChars)
  .orient("left")
  .ticks(10);

const tip = d3
  .tip()
  .attr("class", "d3-tip")
  .offset([-10, 0])
  .html(function (d) {
    return d.value + " works";
  });

const svgChars = d3
  .select("#chargraph")
  .append("svg")
  .attr("width", widthChar + marginChar.left + marginChar.right)
  .attr("height", heightChar + marginChar.top + marginChar.bottom)
  .append("g")
  .attr("transform", "translate(" + marginChar.left + "," + marginChar.top + ")");

svgChars.call(tip);

// open data
d3.json("./data/haikyuu/chars.json", function (error, dataChars) {
  dataChars = dataChars.slice(0, amountOfChars);

  dataChars.forEach(function (d) {
    d.value = +d.value;
  });

  xChars.domain(
    dataChars.map(function (d) {
      return d.character;
    })
  );
  yChars.domain([
    0,
    d3.max(dataChars, function (d) {
      return d.value;
    })
  ]);

  svgChars
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + heightChar + ")")
    .call(xAxisChars)
    .selectAll("text")
    .call(wrap, xChars.rangeBand());

  svgChars
    .append("g")
    .attr("class", "y axis")
    .call(yAxisChars)
    .append("text")
    .attr("y", -4)
    .attr("x", -7)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("font-weight", "bold")
    .text("Works");

  svgChars
    .selectAll(".bar")
    .data(dataChars)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function (d) {
      return xChars(d.character);
    })
    .attr("width", xChars.rangeBand() - 3)
    .attr("y", function (d) {
      return yChars(d.value);
    })
    .attr("height", function (d) {
      return heightChar - yChars(d.value);
    })
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);

  function wrap(text, widthChar) {
    text.each(function () {
      let text = d3.select(this),
        words = text
          .text()
          .split(/\s+/)
          .reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1,
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
        if (tspan.node().getComputedTextLength() > widthChar) {
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
