
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 12000);
});

app.get('/build', function(req, res, next){
    var sys = require('sys')
    var exec = require('child_process').exec;
    var execCommand = '/dev/YOUR_BUILD_COMMAND -with flags';
    res.set('Content-Type', 'text/plain');
    function puts(error, stdout, stderr) {
        if(error){
            return next(new Error(error));
        }
        res.send(stdout);
    }
    exec(execCommand, puts);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
