var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 3000;

app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.get('/', function(req, res){
  res.sendfile('ui/index.html');
});

app.get('/driver', function(req, res){
  res.sendfile('ui/driver.html');
});

app.get('/settings', function(req, res){
  res.sendfile('ui/settings.html');
});

app.get('/app.js', function(req, res){
  res.sendfile('ui/app.js');
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});

/*
*
* rally code below
*
*
*
*/
var rally = require('./rally');
var time = 1456486980000;
rally.setStage([
  {"mileage": 550739, "speed": 30, "instruction":"L@Stop", "time": time, "duration": null},
  {"mileage": 552215, "speed": 36, "instruction":'"60 km/h"', "time": time, "duration": null},
  {"mileage": 552672, "speed": 46, "instruction":'"80 km/h"', "time": time, "duration": null},
  {"mileage": 555816, "speed": 36, "instruction":'"70 km/h"', "time": time, "duration": null},
  {"mileage": 556260, "speed": null, "instruction":"R@Blackwater Rd", "time": time, "duration": null},
  {"mileage": 557540, "speed": 48, "instruction":'"80 km/h"', "time": time, "duration": null},
  {"mileage": 562235, "speed": null, "instruction":'"Gravel begins"', "time": time, "duration": null},
  {"mileage": 574758, "speed": null, "instruction":"END TSD", "time": time, "duration": null}
]);
io.emit("dev:refresh", true);
io.on('connection', function(socket){
  console.log('a user connected');
  //send our stage:
  io.emit('rally:stage', rally.computeStage())
});
var i = 0;
var tick = setInterval(function(){
  io.emit('rally:tick', {
    "time": rally.formatTime(Date.now()),
    "mileage": rally.currentMileage(),
    "speed": rally.currentAverageSpeed(),
    "diff": rally.currentDifference()});
}, 100)

var calcs = setInterval(function(){
  rally.runCalcs();
}, 250)

var pulseSim = setInterval(function(){
  rally.pulse();
}, 23)
