define(["helpers", "d3", "backbone", "jquery"], function(helpers, d3){

    var ScatterChart = Backbone.View.extend({
        defaults: {
            width: 960,
            height: 650,
            dot_radius: 5,
            x_var: null,
            y_var: null,
            r: 5,
            margin: {top: 20, right: 100, bottom: 50, left: 30}
        },

        initialize: function(options) {
            this.options = _.extend({}, this.defaults, options);
        },

        render: function(dataset){
            var opts = this.options
            var tooltip = $("#tooltip")

            this.svg = d3.select(this.el).append("svg")
              .attr("width", this.options['width'] + this.options['margin']['left'] + this.options['margin']['right'])
              .attr("height", this.options['height'] + this.options['margin']['top'] + this.options['margin']['bottom'])
              
            var chart = this.svg.append("g")
              .attr("class", "chart-container")
              .attr("transform", "translate(" + this.options.margin.left + "," + this.options.margin.top + ")");                                          

            var x_scale_func = d3.scale.linear()
                .range([0, this.options['width']])
                .domain(d3.extent(dataset, function(d) {return +d[opts['x_var']]}));

            var y_scale_func = d3.scale.linear()
                .range([this.options['height'], 0])
                .domain(d3.extent(dataset, function(d) {return +d[opts['y_var']]})); 

            var x_axis = d3.svg.axis()
                .scale(x_scale_func)
                .orient("bottom");

            var y_axis = d3.svg.axis()
                .scale(y_scale_func)
                .orient("left");

            chart.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(" + opts['margin'].left + "," + (opts['height'] + opts['margin'].top) + ")")
                .call(x_axis)

            chart.append("g")
                .attr("class", "y axis")
                .call(y_axis)
                .attr("transform", "translate(" + opts['margin'].left + "," + opts['margin'].top + ")") 

            var circles = chart.selectAll("circle")
              .data(dataset).enter().append("circle") 
              .attr("r",opts['r'])
              .attr("cx",function(i){return x_scale_func(i[opts['x_var']])}) 
              .attr("cy",function(i){return y_scale_func(i[opts['y_var']])});

            circles.on("mouseover", function(d){
                    tooltip.css("display", "block");
                    tooltip.append(helpers.generate_tooltip_html(d, opts['tooltip_format']));
                    tooltip.css("top", (d3.event.pageY - 20)+"px")
                      .css("left",(d3.event.pageX + 10)+"px");
                    d3.select(d3.event.target).classed("highlighted", true).moveToFront();
                })
                .on("mouseout", function(d){
                    tooltip.css("display", "none");
                    tooltip.empty();
                    d3.selectAll(".highlighted").classed("highlighted", false);
                });               

            return this;
        },
    });
    return ScatterChart;  
})
