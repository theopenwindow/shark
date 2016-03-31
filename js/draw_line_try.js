var margin = 35,
    width = parseInt(d3.select("#graph").style("width")) - margin*2,
    height = parseInt(d3.select("#graph").style("height")) - margin*2;

var xScale = d3.time.scale()
    .range([0, width])
    .nice(d3.time.year);

var yScale = d3.scale.linear()
    .range([height, 0])
    .nice();

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

// var yAxis = d3.svg.axis()
//     .scale(yScale)
//     .orient("left");

var line = d3.svg.line()
    .x(function(d) { return xScale(d.yearNew); })
    .y(function(d) { return yScale(d.capture); });

var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip");

var dateFormat = d3.time.format("%Y");

var graph = d3.select("#graph")
    .attr("width", width + margin*2)
    .attr("height", height + margin*2)
  .append("g")
    .attr("transform", "translate(" + margin + "," + margin + ")");

d3.csv("data/data_long.csv", function(error, data) {
  data.forEach(function(d) {
     d.yearNew = d3.time.format("%Y").parse(d.year);
     d.capture = +d.capture;
     d.x = d3.time.format("%Y").parse(d.year);
     d.y = +d.capture;
    // console.log(data);
  });

  xScale.domain(d3.extent(data, function(d){
            return d.yearNew;
            })
        );
  yScale.domain([0, d3.max(data, function(d) {
            return +d.capture;
          })
        ]);

  graph.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  var circles = graph.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("class","circles");

  circles.attr("cx", function(d) {
            return xScale(d.yearNew);
          })
          .attr("cy", function(d) {
            return yScale(d.capture);
          })
          .attr("r", 5)
          .style("opacity", 0)
          .attr("fill", "rgba(115,176,198,0.9)"); 

  circles
          .on("mouseover", mouseoverFunc)
          .on("mousemove", mousemoveFunc)
          .on("mouseout", mouseoutFunc);

  function mouseoverFunc(d) {
          d3.select(this)
            .transition()
            .style("opacity", 0.8)
            .attr("r", 9);
          tooltip
            .style("display", null) // this removes the display none setting from it
            .html("<p>" + d.capture + " sharks were captured in " + d.year);
          }

  function mousemoveFunc(d) {
          tooltip
            .style("top", (d3.event.pageY - 10) + "px" )
            .style("left", (d3.event.pageX + 10) + "px");
          }

  function mouseoutFunc(d) {
          d3.select(this)
            .transition()
            .style("opacity", 0)
            .attr("r", 5);
          tooltip.style("display", "none");  // this sets it to invisible!
        }

  // graph.append("g")
  //     .attr("class", "y axis")
  //     .call(yAxis)
  //   .append("text")
  //     .attr("transform", "rotate(-90)")
  //     .attr("y", 6)
  //     .attr("dy", ".71em")
  //     .style("text-anchor", "end")
  //     .text("Capture");

  graph.append("path")
      // .datum(data)
      .attr("class", "line")
      // .attr("d", line);


  function getSmoothInterpolation() {
  var interpolate = d3.scale.linear()
        .domain([0,1])
        .range([1, data.length + 1]);

  return function(t) {
    var flooredX = Math.floor(interpolate(t));
    var interpolatedLine = data.slice(0, flooredX);

    if (flooredX > 0 && flooredX < data.length) {
        var weight = interpolate(t) - flooredX;
        var weightedLineAverage = data[flooredX].y * weight + data[flooredX-1].y * (1-weight);
        interpolatedLine.push({"x":interpolate(t)-1, "y":weightedLineAverage});
    }

    return line(interpolatedLine);
  }
}

// d3.select("#button2")
//   .on("click", function() {
//       d3.select("#graph .line")
//       .transition()
//       .duration(6000)
//       .attrTween("d", getSmoothInterpolation);
//   });


  function resize() {
    var width = parseInt(d3.select("#graph").style("width")) - margin*2,
    height = parseInt(d3.select("#graph").style("height")) - margin*2;

    xScale.range([0, width]).nice(d3.time.year);
    yScale.range([height, 0]).nice();

    // yAxis.ticks(Math.max(height/50, 2));
    xAxis.ticks(Math.max(width/100, 2));

    graph.select('.x.axis')
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    // graph.select('.y.axis')
    //   .call(yAxis);

    graph.selectAll('.line')
      .transition()
      .duration(6000)
      .attrTween("d", getSmoothInterpolation);;

    graph.selectAll('.circles')
      .attr("cx", function(d) {
            return xScale(d.yearNew);
          })
          .attr("cy", function(d) {
            return yScale(d.capture);
          });
  }

    d3.select(window).on('resize', resize); 

    resize();
});//End of csv.



