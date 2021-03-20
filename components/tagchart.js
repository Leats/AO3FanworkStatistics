// define size of graphic
const marginTag = { top: 30, right: 20, bottom: 80, left: 60 },
  widthTag = 1270 - marginTag.left - marginTag.right,
  heightTag = 350 - marginTag.top - marginTag.bottom;

// set number of characters displayed
const amountOfTag = 20;

const xTag = d3.scale.ordinal().rangeRoundBands([0, widthTag], 0.05);
const yTag = d3.scale.linear().range([heightTag, 0]);

const xAxisTag = d3.svg
  .axis()
  .scale(xTag)
  .orient("bottom");

const yAxisTag = d3.svg
  .axis()
  .scale(yTag)
  .orient("left")
  .ticks(10);

const svgTag = d3
  .select("#taggraph")
  .append("svg")
  .attr("width", widthTag + marginTag.left + marginTag.right)
  .attr("height", heightTag + marginTag.top + marginTag.bottom)
  .append("g")
  .attr("transform", "translate(" + marginTag.left + "," + marginTag.top + ")");

svgTag.call(tip);

// open data
d3.json("./data/haikyuu/tags.json", function (error, dataTag) {
  dataTag = dataTag.slice(0, amountOfTag);

  dataTag.forEach(function (d) {
    d.value = +d.value;
  });

  xTag.domain(
    dataTag.map(function (d) {
      return d.tag;
    })
  );
  yTag.domain([
    0,
    d3.max(dataTag, function (d) {
      return d.value;
    })
  ]);

  svgTag
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + heightTag + ")")
    .call(xAxisTag)
    .selectAll("text")
    .call(wrap, xTag.rangeBand());

  svgTag
    .append("g")
    .attr("class", "y axis")
    .call(yAxisTag)
    .append("text")
    .attr("y", -14)
    .attr("x", -7)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("font-weight", "bold")
    .text("Works");

  svgTag
    .selectAll(".bar")
    .data(dataTag)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function (d) {
      return xTag(d.tag);
    })
    .attr("width", xTag.rangeBand() - 3)
    .attr("y", function (d) {
      return yTag(d.value);
    })
    .attr("height", function (d) {
      return heightTag - yTag(d.value);
    })
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);

  function wrap(text, widthTag) {
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
        if (tspan.node().getComputedTextLength() > widthTag) {
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
