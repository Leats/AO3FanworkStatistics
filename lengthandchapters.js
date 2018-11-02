var margin6 = { top: 30, right: 60, bottom: 80, left: 60 },
  width6 = 1270 - margin6.left - margin6.right,
  height6 = 500 - margin6.top - margin6.bottom;

const kformatter = d3.format(".3s");
const chapterformatter = d3.format(".3n");
const percentformatter = d3.format(".1%");

let currentYAxis = "chapters";

const binamount = 50;

const largestwork = 90000;

var x6 = d3.scale.linear().range([0, width6], 0.05);

var y6 = d3.scale.linear().range([height6, 0]);

var y26 = d3.scale.linear().range([height6, 0]);

var xAxis6 = d3.svg
  .axis()
  .scale(x6)
  .ticks(binamount / 2)
  .orient("bottom");

var yAxis6 = d3.svg
  .axis()
  .scale(y6)
  .orient("left")
  .ticks(10);

var yAxis26 = d3.svg
  .axis()
  .scale(y26)
  .orient("right")
  .ticks(5);

var tip6 = d3
  .tip()
  .attr("class", "d3-tip")
  .offset([-10, 0])
  .html(function(d) {
    return (
      d.amount +
      " works<br>ø " +
      chapterformatter(d.chapters) +
      " chapters<br>" +
      percentformatter(d.done) +
      " of works finished"
    );
  });

var svg6 = d3
  .select("#lengthgraph")
  .append("svg")
  .attr("width", width6 + margin6.left + margin6.right)
  .attr("height", height6 + margin6.top + margin6.bottom)
  .append("g")
  .attr("transform", "translate(" + margin6.left + "," + margin6.top + ")");

svg6.call(tip6);

d3.csv("dragonageworklengths.csv", function(error, data6) {
  const minvalue = data6[0].lengths;
  //const maxvalue = data6[data6.length - 1].lengths;
  const maxvalue = largestwork;

  //Prepares Array for the histogram
  let histdata = new Array(binamount);
  for (let i = 0; i < binamount; i++) {
    histdata[i] = { amount: 0, chapters: 0, done: 0 };
  }
  //calculate the size of the bins
  binsize = maxvalue / binamount;

  data6.forEach(function(d) {
    if (d.lengths <= largestwork) {
      d.lengths = +d.lengths;
      d.chapters = +d.chapters;
      //var bin = Math.floor(d.lengths / binsize);
      var bin = Math.floor(d.lengths / binsize);
      if (bin.toString() != "NaN" && bin < histdata.length) {
        histdata[bin].amount += 1;
        histdata[bin].chapters += d.chapters;
        if (d.done == "True") {
          histdata[bin].done += 1;
        }
      }
    }
  });
  histdata.forEach(function(d) {
    if (d.chapters != 0) {
      d.chapters = d.chapters / d.amount;
    }
    if (d.done != 0) {
      d.done = d.done / d.amount;
    }
  });

  x6.domain([0, binamount]);
  y6.domain([
    0,
    d3.max(histdata, function(d) {
      return d.amount;
    })
  ]);
  y26.domain([
    0,
    d3.max(histdata, function(d) {
      return d.chapters;
    })
  ]);
  xAxis6.tickFormat(function(d) {
    return kformatter(d * binsize);
  });

  svg6
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height6 + ")")
    .call(xAxis6)
    .append("text")
    .attr("y", +25)
    .attr("x", width6 - 30)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("font-weight", "bold")
    .text("Word Count");

  svg6
    .append("g")
    .attr("class", "y axis")
    .call(yAxis6)
    .append("text")
    .attr("y", -6)
    .attr("x", -7)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("font-weight", "bold")
    .text("Works");

  svg6
    .append("g")
    .attr("class", "y axis")
    .attr("id", "secondAxis")
    .attr("transform", "translate(" + width6 + " ,0)")
    .call(yAxis26)
    .append("text")
    //.attr("transform", "rotate(-90)")
    .attr("y", -6)
    .attr("x", +60)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("font-weight", "bold")
    .attr("id", "yAxistitle")
    .text("ø chapters");

  svg6
    .append("rect")
    .attr("height", "20")
    .attr("width", "300")
    .attr("x", width6 - 708)
    .attr("y", -8)
    .style("fill", "#FEEB97")
    .style("stroke", "#D96412")
    .style("stroke-width", "2px");

  svg6
    .append("svg:text")
    .attr("class", "nodetext")
    .attr("dx", width6 - 700)
    .attr("dy", ".35em")
    .style("font-weight", "bold")
    .style("fill", "#D96412")
    .style("font-size", "13px")
    .style("text-decoration", "underline")
    .text("Toggle between chapters and completion rate")
    .on("mouseover", function(d) {
      d3.select(this).style("fill", "#b54c03");
    })
    .on("mouseout", function(d) {
      d3.select(this).style("fill", "#D96412");
    })
    .on("click", function(d) {
      updateData();
    });

  svg6
    .selectAll(".bar")
    .data(histdata)
    .enter()
    .append("rect")
    .style("fill", "#447f85")
    .attr("x", function(d) {
      return x6(histdata.indexOf(d)) + 1;
    })
    .attr("width", (width6 - margin6.left - margin6.right) / binamount)
    .attr("y", function(d) {
      return y6(d.amount);
    })
    .attr("height", function(d) {
      return height6 - y6(d.amount);
    });

  svg6
    .selectAll(".dot")
    .data(histdata)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("id", "ydots")
    .attr("r", ((width6 - margin6.left - margin6.right) / binamount - 7) / 2)
    .attr("cx", function(d) {
      return (
        x6(histdata.indexOf(d)) +
        1 +
        (width6 - margin6.left - margin6.right) / binamount / 2
      );
    })
    .attr("cy", function(d) {
      return y26(d.chapters);
    })
    .style("fill", "#D96412")
    .on("mouseover", function(d) {
      d3.select(this).style("fill", "#FEEB97");
      tip6.show(d);
    })
    .on("mouseout", function(d) {
      d3.select(this).style("fill", "#D96412");
      tip6.hide();
    });

  function updateData() {
    // Select the section we want to apply our changes to
    const svg6 = d3.select("#lengthgraph").transition();
    const dots = svg6.select("g").selectAll(".dot");
    let yvalues = "";
    let yAxistitle = "";

    // Scale the range of the data again
    if (currentYAxis == "chapters") {
      y26.domain([
        0,
        d3.max(histdata, function(d) {
          return d.done;
        })
      ]);
      yvalues = "done";
      yAxistitle = "% completion";
      currentYAxis = "completion";
    } else {
      y26.domain([
        0,
        d3.max(histdata, function(d) {
          return d.chapters;
        })
      ]);
      yvalues = "chapters";
      yAxistitle = "ø chapters";
      currentYAxis = "chapters";
    }

    // Make the changes
    svg6
      .select("#secondAxis") // change the y axis
      .duration(550)
      .call(yAxis26);

    svg6
      .select("#yAxistitle") // change the title of the axis
      .duration(550)
      .text(yAxistitle);
    dots
      .transition()
      .duration(550)
      .attr("cy", function(d) {
        return y26(d[yvalues]);
      });
  }
});
