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
        .defer(d3.csv, "/raw_logs/foreigners-by-kommune.csv")
        .await(ready);

    function ready(error, dk_map, foreigners_data) {

        var ch = new BaseChart({
            el: "#foreigners",
            palette: "Greens",
            tooltip: true,
            enhance: false,
            buckets: 6,
            domain: [0, 0.15],
            tooltip_format: d3.format(".2%"),
            legend_format: d3.format(".2%"),
            template_string: "Share of foreigners by kommune in 2012",
            sparkline: false           
        });
        ch.render();
        ch.render_map(dk_map);
        ch.render_legend();

        ch.render_cholopleth(foreigners_data, "share"); 
    }
})
