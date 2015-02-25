requirejs.config({
    paths: {
        jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min',
        backbone: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
        d3: "//cdnjs.cloudflare.com/ajax/libs/d3/3.4.9/d3.min",
        queue: "/js/vendor/queue.v1.min",
        topojson: "//cdnjs.cloudflare.com/ajax/libs/topojson/1.1.0/topojson.min",
        underscore: "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min",
        colorbrewer: "/js/vendor/colorbrewer",
        jqueryui: "//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min"
    },
    shims: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        "colorbrewer" :{
            exports: "colorbrewer"
        },
        "jqueryui": {
            deps: ["jquery"]
        }
    }
});

require(["chart_base","scatter_base", "queue", "d3"], function(BaseChart,ScatterChart, queue, d3){
    d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };

    queue()
        .defer(d3.json, "/js/vendor/dk.json")
        .defer(d3.csv, "/raw_logs/tax_rate.csv")
        .defer(d3.csv, "/raw_logs/income.csv")        
        .await(ready);

    function ready(error, dk_map, tax_data, income_data) {

        var ch = new BaseChart({
            el: "#taxes",
            palette: "Oranges",
            tooltip: true,
            enhance: false,
            prefix: "tax-",
            buckets: 8,
            domain: [0.25, 0.45],
            tooltip_margins: {top: 0, right: 15, bottom: 10, left: 40},            
            tooltip_format: d3.format(".2%"),
            legend_format: d3.format(".2%"),
            template_string: "Share of household income that goes to taxes in <%= year %>" ,
            y_label: "Tax rate"           
        });
        ch.render();
        ch.render_map(dk_map);
        ch.render_legend();

        ch.render_cholopleth(tax_data, "tax-2000");  
        ch.render_slider(tax_data)  

        scatter_dataset = []

        tax_data.forEach(function(d){
            scatter_dataset.push({kommune: d["muni"], 
                "tax rate": d["tax-2012"], 
                income: _.findWhere(income_data, {muni: d["muni"]})["2012"]})
        })

        f = function(num){
            var func;
            if(num < 1) {
                func = d3.format(".2%")
            } else {
                func = d3.format("0,000")
            }
            return func(num)
        }

        var sc = new ScatterChart({
            el: "#scatter",
            width: 500,
            height: 500,            
            x_var: "income",
            y_var: "tax rate",
            tooltip_format: f,
            r: 7,
        }); 

        sc.render(scatter_dataset)       

    }
})