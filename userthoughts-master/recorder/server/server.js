#!/usr/bin/env node

//var WebSocketServer = require('../websocket_node/lib/WebSocketServer');
var WebSocketServer = require('ws').Server;

var http = require('http');
var url = require('url');
var fs = require('fs');
var im = require('imagemagick');
var exec = require('child_process').exec;
var connect = require('connect');

var args = { /* defaults */
  port: process.env.PORT || 3000
};

var HOST = process.env.SERVER_IP || "192.168.0.124";

/* Parse command line options */
var pattern = /^--(.*?)(?:=(.*))?$/;
process.argv.forEach(function(value) {
  var match = pattern.exec(value);
  if (match) {
    args[match[1]] = match[2] ? match[2] : true;
  }
});

var port = parseInt(args.port, 10);

console.log("Usage: ./server.js [--port="+port+"]");

var connections = {}; 

// ws is the fastest websocket lib:
// http://einaros.github.com/ws/
var wsServer = new WebSocketServer({port: port});

//Serve Videos
connect.createServer(
    connect.static(__dirname+"/videos")
).listen(3030);

function  convertBlobToImage(data, count, path) {
    var fileName = path+"/"+count+".jpeg";  //'frames/'+count + ".jpg";
    console.log("Count "+fileName);

    im.resize({
                  srcData: data,
                  width:   1280
              }, function(err, stdout, stderr){
                  if (err) throw err;
                  fs.writeFileSync(fileName, stdout, 'binary');
              });


    im.identify(fileName, function(err, features){
      if (err) throw err;
      console.log(features);
      // { format: 'JPEG', width: 3904, height: 2622, depth: 8 }
    });
}

function createVideoWhenLastFileReady(id,count) {
    var fileCheckInterval = setInterval(
        function() {
            if(fs.existsSync("frames/"+id+"/"+count+".jpeg")){
                clearInterval(fileCheckInterval);
                createVideo(id);
            }
        },250);
}

function createVideo(id){
    console.log("\nCreating video for id: "+id);
    exec("ffmpeg -y -f image2 -r 1000/200 -i frames/"+id+"/%d.jpeg -s 1280x720 -b 4M -bt 5M  -vcodec libvpx videos/"+id+".webm",
         function(error, stdout, stderr){
             if (error !== null) {
                 console.log('exec error: ' + error);
             }else{
                 console.log("\nCreated video for id: "+id);
                 var message = "{\"cmd\": \"URL\", \"url\": \"http://"+HOST+"/"+id+".webm\"}";
                 connections[id].send(message, 
                     {
                         binary: false,
                         mask: false
                     });
             }    
             deleteFolder("frames/"+id);
         });
}

function createFolder(path){
    fs.mkdirSync(path);
}
function deleteFolder(path){
    var files = fs.readdirSync(path);
    files.forEach(
        function(file,index){
            var curPath = path + "/" + file;
            fs.unlinkSync(curPath);
        });
    fs.rmdirSync(path); 
}

function deleteOldFrames(path){
    var files = fs.readdirSync(path);
    files.forEach(
        function(file,index){
            var curPath = path + "/" + file;
            fs.unlinkSync(curPath);
        });
}

wsServer.on('connection', function(ws) {
  var count = 0;              
  ws.id = Date.now(); // Assign unique id to this ws connection.
  connections[ws.id] = ws;

  console.log((new Date()) + ' Connection accepted: ' + ws.id);
  createFolder("frames/"+ws.id);
  ws.on('message', function(message, flags) {
    console.log('Received ' + (flags.binary ? 'binary' : '') + ' message: ' +
                message.length + ' bytes.');
          
            if(flags.binary){
                count = count + 1;
                convertBlobToImage(message, count, "frames/"+ws.id);
            }else{
                if(JSON.parse(message).cmd == "DONE"){
                    createVideoWhenLastFileReady(ws.id,count);
                }
            }
  });

  ws.on('close', function() {
    console.log((new Date()) + " Peer " + this.id + " disconnected.");
    delete connections[this.id];
  });
});
