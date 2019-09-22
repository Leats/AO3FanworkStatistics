// define size of graphic
const margin3 = { top: 20, right: 20, bottom: 30, left: 40 },
  width3 = 1270 - margin3.left - margin3.right,
  height3 = 350 - margin3.top - margin3.bottom;

const x03 = d3.scale.ordinal().rangeRoundBands([0, width3], 0.1);
const x13 = d3.scale.ordinal();
const y3 = d3.scale.linear().range([height3, 0]);

const xAxis3 = d3.svg
  .axis()
  .scale(x03)
  .tickSize(0)
  .orient("bottom");

const yAxis3 = d3.svg
  .axis()
  .scale(y3)
  .orient("left");

const tip3 = d3
  .tip()
  .attr("class", "d3-tip")
  .offset([-10, 0])
  .html(function(d) {
    return d.value + " works";
  });

const color = d3.scale
  .ordinal()
  .range(["#510c5c", "#98065e", "#d12e50", "#f56735", "#ffa600"]);

const svg3 = d3
  .select("#mainchargraph")
  .append("svg")
  .attr("width", width3 + margin3.left + margin3.right)
  .attr("height", height3 + margin3.top + margin3.bottom)
  .append("g")
  .attr("transform", "translate(" + margin3.left + "," + margin3.top + ")");

svg3.call(tip3);

d3.json("./data/dragonageinquisitionmains.json", function(error, data3) {
  const categoriesNames = data3.map(function(d) {
    return d.categorie;
  });
  const rateNames = data3[0].values.map(function(d) {
    return d.rate;
  });

  x03.domain(categoriesNames);
  x13.domain(rateNames).rangeRoundBands([0, x03.rangeBand()]);
  y3.domain([
    0,
    d3.max(data3, function(categorie) {
      return d3.max(categorie.values, function(d) {
        return d.value;
      });
    })
  ]);

  svg3
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height3 + ")")
    .call(xAxis3);

  svg3
    .append("g")
    .attr("class", "y axis")
    .style("opacity", "0")
    .call(yAxis3)
    .append("text")
    .attr("y", -6)
    .attr("x", -7)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("font-weight", "bold")
    .text("Works");

  svg3
    .select(".y")
    .transition()
    .duration(500)
    .delay(1300)
    .style("opacity", "1");

  const slice = svg3
    .selectAll(".slice")
    .data(data3)
    .enter()
    .append("g")
    .attr("class", "g")
    .attr("transform", function(d) {
      return "translate(" + x03(d.categorie) + ",0)";
    });

  slice
    .selectAll(".bar")
    .data(function(d) {
      return d.values;
    })
    .enter()
    .append("rect")
    .attr("width", x13.rangeBand())
    .attr("x", function(d) {
      return x13(d.rate);
    })
    .style("fill", function(d) {
      return color(d.rate);
    })
    .attr("y", function(d) {
      return y3(0);
    })
    .attr("height", function(d) {
      return height3 - y3(0);
    })
    .on("mouseover", function(d) {
      tip3.show(d, this);
      d3.select(this).style("fill", d3.rgb(color(d.rate)).darker(2));
    })
    .on("mouseout", function(d) {
      tip3.hide();
      d3.select(this).style("fill", color(d.rate));
    });
  /*
    .on("mouseover", tip3.show)
    .on("mouseout", tip3.hide);*/

  slice
    .selectAll("rect")
    .transition()
    .delay(function(d) {
      return Math.random() * 1000;
    })
    .duration(1000)
    .attr("y", function(d) {
      return y3(d.value);
    })
    .attr("height", function(d) {
      return height3 - y3(d.value);
    });

  //Legend
  const legend = svg3
    .selectAll(".legend")
    .data(
      data3[0].values
        .map(function(d) {
          return d.rate;
        })
        .reverse()
    )
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) {
      return "translate(0," + i * 20 + ")";
    })
    .style("opacity", "0");

  legend
    .append("rect")
    .attr("x", width3 - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", function(d) {
      return color(d);
    });

  legend
    .append("text")
    .attr("x", width3 - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) {
      return d;
    });

  legend
    .transition()
    .duration(500)
    .delay(function(d, i) {
      return 1300 + 100 * i;
    })
    .style("opacity", "1");
});
