requirejs.config({
    paths: {
        jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min',
        highlight: "//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.1/highlight.min",
        simpleexpand: "/js/vendor/simple-expand.min"
    },
    shims: {
        'highlight': {
            deps: ["jquery"]
        },
        "simpleexpand": {
            deps: ["jquery"]
        }
    }
});

require(["jquery",'highlight','simpleexpand'],function(){
    $(function() {
        hljs.initHighlighting();
        $('.expander').simpleexpand();
    });    
})
