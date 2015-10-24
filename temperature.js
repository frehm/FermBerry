'use strict';

var events = require('events');
var fs = require('fs');

class Temperature extends events.EventEmitter {
  constructor(path, name) {
    super();

    this.path = path;
    this.name = name;
    this.sensorMin = -55;
    this.sensorMax = 125;
    this.enabled = false;

  }

  _poll = function () {
    var self = this;

    fs.readFile(path, 'utf8', function (err, data) {

      if (err) {
        self.emit('error', 'fail_read_file');
      } else {

        let crcOk = data.match(/YES/g);

        if (crcOk) {
          let signal = data.match(/t=(\-?\d+)/i);
          let temperature = signal[1] / 1000.0;

          if (Number.parseInt(signal[1], 10) === 85000) {
            self.emit('error', 'sensor_power_on');
          } else if (temperature < self.sensorMin || temperature > self.sensorMax) {
            self.emit('error', 'out_of_range');
          } else {
            self.emit('data', {
              name: self.name,
              time: new Date(),
              temperature: temperature
            });
          }
        // crc not ok
        } else {
          self.emit('error', 'crc_not_ok');
        }

      }

      if (self.enabled) {
        setTimeout(function () {
          self._poll();
        }, 1);
      } else {
        self.emit('end', 'disabled');
      }

    });

  }

  startPolling = function () {
    this.enabled = true;

    _poll();

  }

  stopPolling = function () {
    this.enabled = false;
  }

}

module.exports = Temperature;
