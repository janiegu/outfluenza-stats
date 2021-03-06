/* Age distribution chart */
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 500 - margin.left - margin.right,
    height = 275 - margin.top - margin.bottom;
 
var formatPercent = d3.format(".0%");
 
var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1, 1);
 
var y = d3.scale.linear()
    .range([height, 0]);
 
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
 
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(formatPercent);
 
var svg = d3.select("#ageDistribution").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 
d3.tsv("data.tsv", function(error, data) {
 
  data.forEach(function(d) {
    d.frequency = +d.frequency;
  });
 
  x.domain(data.map(function(d) { return d.age; }));
  y.domain([0, d3.max(data, function(d) { return d.frequency; })]);
 
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
 
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Frequency");
 
  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.age); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.frequency); })
      .attr("height", function(d) { return height - y(d.frequency); });
 
  d3.select("input").on("change", change);
 
  var sortTimeout = setTimeout(function() {
    d3.select("input").property("checked", true).each(change);
  }, 2000);
 
  function change() {
    clearTimeout(sortTimeout);
 
    // Copy-on-write since tweens are evaluated after a delay.
    var x0 = x.domain(data.sort(this.checked
        ? function(a, b) { return b.frequency - a.frequency; }
        : function(a, b) { return d3.ascending(a.age, b.age); })
        .map(function(d) { return d.age; }))
        .copy();
 
    var transition = svg.transition().duration(750),
        delay = function(d, i) { return i * 50; };
 
    transition.selectAll(".bar")
        .delay(delay)
        .attr("x", function(d) { return x0(d.age); });
 
    transition.select(".x.axis")
        .call(xAxis)
      .selectAll("g")
        .delay(delay);
  }
});

/* Gender pie chart */
var widthGender = 250,
heightGender = 220,
radiusGender = Math.min(width, height) / 2;

var color = d3.scale.ordinal()
.range(["#FE7569", "#CDFFFF"]);

var arc = d3.svg.arc()
.outerRadius(radiusGender - 20)
.innerRadius(radiusGender - 70);

var pie = d3.layout.pie()
.sort(null)
.value(function(d) { return d.population; });

var svgGender = d3.select("#genderSplit").append("svg")
.attr("width", widthGender)
.attr("height", heightGender)
.append("g")
.attr("transform", "translate(" + widthGender / 2 + "," + heightGender / 2 + ")");

d3.csv("gender.csv", function(error, data) {

	  data.forEach(function(d) {
	    d.population = +d.population;
	  });

	  var g = svgGender.selectAll(".arc")
	      .data(pie(data))
	    .enter().append("g")
	      .attr("class", "arc");

	  g.append("path")
	      .attr("d", arc)
	      .style("fill", function(d) { return color(d.data.gender); });

	  g.append("text")
	      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
	      .attr("dy", ".35em")
	      .style("text-anchor", "middle")
	      .text(function(d) { return d.data.gender; });
	});

