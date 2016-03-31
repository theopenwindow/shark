      var width = 700;
      var height = 600;
      var margin = { top: 20, right: 10, bottom: 50, left: 100};


      //Set up date formatting and years
      var dateFormat = d3.time.format("%Y");


      var xScale = d3.time.scale()
                .range([ margin.left, width - margin.right - margin.left ]);

      var yScale = d3.scale.linear()
                .range([ margin.top, height - margin.bottom ]);


      var xAxis = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(15)
              .tickFormat(function(d) {
                return dateFormat(d);
              });

      var yAxis = d3.svg.axis()
              .scale(yScale)
              .orient("left");


      var line = d3.svg.line()
        .x(function(d) {
          return xScale(dateFormat.parse(d.year));
        })
        .y(function(d) {
          return yScale(d.capture);
        });



      var svg = d3.select("#sharkDecline")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

      d3.csv("data/data_long.csv", function(myData) {

        // get the min and max of the years in the data, after parsing as dates!
        xScale.domain(d3.extent(myData, function(d){
            return dateFormat.parse(d.year);
            })
        );

        // the domain is from the max of the emissions to 0 - remember it's reversed.
        yScale.domain([ d3.max(myData, function(d) {
            return +d.capture;
          }),
          0
        ]);

        console.log("my data", myData);

        // instead of all this:

        // var circles = svg.selectAll("circle")
        //        .data(data)
        //        .enter()
        //        .append("circle");

        // circles.attr("cx", function(d) {
        //    return xScale(dateFormat.parse(d.year));
        //  })
        //  .attr("cy", function(d) {
        //    return yScale(d.emissions);
        //  })
        //  .attr("r", 4)
        //  .attr("fill", "steelblue")
        //  .append("title")
        //  .text(function(d) {
        //    return d.year + " emissions: " + d.emissions + " kt";
        //  });

        //Line
        //

        // Lines take a single array of data as their input.  So we don't give it data(data).

        // you could do this:
        // .data([data])
        // or use the d3 "datum" which is for single data elements.

        svg.datum(myData)
          .append("path")
          .attr("class", "line usa")
          .attr("d", line)  // line is a function that will operate on the data array, with x and y.
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 2);

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (height - margin.bottom + 10) + ")")
          .call(xAxis);

        svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + (margin.left - 10) + ",0)")
          .call(yAxis);

      });