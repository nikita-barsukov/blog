requirejs.config({
    paths: {
        jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min',
        backbone: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
        d3: "//cdnjs.cloudflare.com/ajax/libs/d3/3.4.9/d3.min",
        queue: "d3js.org/queue.v1.min",
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

require(["chart_base", "queue", "d3"], function(BaseChart, queue, d3){
    d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };

    queue()
        .defer(d3.json, "/js/vendor/dk.json")
        .defer(d3.csv, "/raw_logs/disposable_household_income.csv")
        .await(ready);

    function ready(error, dk_map, income_data) {

        var ch = new BaseChart({
            el: "#disposable-income",
            palette: "PuRd",
            tooltip: true,
            enhance: false,
        });
        ch.render();
        ch.render_map(dk_map);

        ch.render_cholopleth(income_data, "y-2000");
        ch.render_legend()
        ch.render_slider(income_data)       
    }
})