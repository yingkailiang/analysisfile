var S = KISSY, E = S.Event, D = S.DOM;
S.ready(function(){
    var delay = D.get('#fem_J_NetSpeed');
    var delayCheck = D.get('#fem_J_SlowSpeed');
    E.on(delay, 'valuechange', function(e){
        window.localStorage.setItem("netspeeddelay", e.target.value)
    });
    D.val(delay, window.localStorage.getItem('netspeeddelay'));
    E.on(delayCheck, 'change', function(e){
        window.localStorage.setItem("isnetspeeddelay", e.target.checked);
    });
    D.attr(delayCheck, "checked", window.localStorage.getItem("isnetspeeddelay") !== "false");


    var debug = D.get('#fem_J_Debug');
    E.on(debug, 'change', function(e){
        window.localStorage.setItem("debug", e.target.checked);
    });
    D.attr(debug, "checked", window.localStorage.getItem("debug") !== "false");


    var debug = D.get('#fem_J_TImageCapture');
    E.on(debug, 'change', function(e){
        window.localStorage.setItem("debug", e.target.checked);
    });
    D.attr(debug, "checked", window.localStorage.getItem("imageCap") !== "false");

});
