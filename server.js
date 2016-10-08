'use strict';

const express = require('express');
const morgan = require('morgan');
const Temperature = require('./temperature.js');
const Logger = require('./logger.js');
const config = require('./config.json');

let logger = new Logger(0.001);
let temperatures = config.sensors.map(sensor => {
  let sensorTemp = new Temperature(sensor.path, sensor.name);

  sensorTemp.on('data', function (data) {
    logger.temperature(data);

  });

  sensorTemp.on('error', function (message) {
    console.log('error', message);
  });

  return sensorTemp;
});

const app = express();

app.use(morgan('dev'));

/*app.get('api/info', function (req, res) {

  res.json({
    ok: true,
    pid: {
      auto: pid.auto,
      setpoint: pid.setpoint
    },
    temperature: {
      beer: {
        enabled: beerTemperature.enabled
      }
    }
  });

});*/

/*app.post('api/pid.start', function (req, res) {

  pid.setAuto();

  res.json({
    ok: true
  });

});

app.post('api/pid.stop', function (req, res) {

  pid.setManual();

  res.json({
    ok: true
  });

});*/

app.post('api/logging.start', function (req, res) {

  temperatures.forEach(t => t.startPolling());

  res.json({
    ok: true
  });

});

app.post('api/logging.stop', function (req, res) {

  temperatures.forEach(t => t.stopPolling());

  res.json({
    ok: true
  });

});

const server = app.listen(3101, function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log('Api started at http://%s:%s', host, port);

  temperatures.forEach(t => t.startPolling());
});
