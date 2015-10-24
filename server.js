'use strict';

var express = require('express');
var morgan = require('morgan');
var Temperature = require('./temperature')
var PidController = require('./pid-controller');
var Logger = require('./logger');

//TODO: Get initializing parameters from config/db
var logger = new Logger(0.062);
var pid = new PidController(19.7, 1, 300, 50);
var beerTemperature = new Temperature('/sys/bus/w1/devices/28-0414695d25ff/w1_slave', 'beer');

//TODO: Continuously read temperature and update pid, pid.input(temperature);
beerTemperature.on('data', function (data) {

  if (data.name === 'beer') {
    pid.input(data.temperature);
  }

  logger.temperature(data);

});

beerTemperature.on('error', function (message) {
  console.log('error', message);
});

pid.on('output', function (output) {
  console.log('output', output);
});

var app = express();

app.use(morgan('dev'));

app.get('api/info', function (req, res) {

  res.json({
    success: true,
    message: 'Not yet implemented'
  });

});

app.post('api/start', function (req, res) {

  pid.setAuto();

  res.json({
    success: true
  });

});

app.post('api/stop', function (req, res) {

  pid.setManual();

  res.json({
    success: true
  });

});



var server = app.listen(3101, function () {
  var host = server.address().address;
  var port = server.address().port;

  beerTemperature.startPolling();

  console.log('Api started at http://%s:%s', host, port);
});
