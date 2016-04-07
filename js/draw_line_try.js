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
          .attr("r", 7)
          .attr("fill", "rgba(115,176,198,0.9)")
          .attr("opacity",0); 

  circles
          .on("mouseover", mouseoverFunc)
          .on("mousemove", mousemoveFunc)
          .on("mouseout", mouseoutFunc);

//set the label:
  var text = graph.selectAll("text")
      .data(data)
      .enter()
      .append("text");

  function mouseoverFunc(d) {
          d3.select(this)
            .transition()
            .style("opacity", 0.8)
            .attr("r", 10);
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

  var path = graph.append("path")
      // .datum(data)
      .attr("class", "line")
      .style("display","none");
      // .attr("d", line);

  graph.append("text")
      // .attr("x", 0)
      // .attr("y","20vh")
      .text("· Hover over the line to see more details.")
      .attr("class","notice")
      .attr("fill","#ccc")
      .attr("stroke","rgba(0,0,0,0)");


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

    path
      .attr("d", line(data));

    var totalLength = path.node().getTotalLength();

    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .style("display", null)
      .transition()
      .duration(5000)
      .ease("linear")
      .attr("stroke-dashoffset", 0);

    graph.selectAll('.circles')
      .transition()
      .delay(5000)
      .style("opacity", function(d){
            if(d.year === "1965" || d.year === "2011" ){
            return 0.8;
          } else {return 0}
          })
      .duration(1000)
      .attr("cx", function(d) {
            return xScale(d.yearNew);
          })
      .attr("cy", function(d) {
            return yScale(d.capture);
          });

    graph.selectAll(".notice")
      .attr("x",0)
      .attr("y", height/4.5);

    // function getTextWidth(text, fontSize, fontFace) {
    //   var a = document.createElement('canvas');
    //   var b = a.getContext('2d');
    //   b.font = fontSize + 'px ' + fontFace;
    //   return b.measureText(text).width;
    // } 

    text
      .transition()
      .delay(5000)
      .attr("opacity",1)
      .duration(1000)
      .attr("transform", function(d,i){
          if(d.year === "1965" || d.year === "2011" ){
            return "translate("+ xScale(d.x)+ "," + (yScale(d.y))+ ")";
          }
        })
        .text(function(d,i){
          if(d.year === "1965" || d.year === "2011"){
          return d.capture           
          }
        })
        .attr("font-family", "'Lato', sans-serif")
        // .attr("font-size", "1.3vw")
        .attr("dx","-4.3em")
        .attr("dy", "1.5em")
        .attr("fill", "rgba(115,176,198,0.9)")
        .attr("class","labelOnLine");


  }

    d3.select(window).on('resize', resize); 

    resize();
});//End of csv.



