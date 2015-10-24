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
    this.wait = 0;
  }

  _poll() {
    var self = this;

    fs.readFile(this.path, 'utf8', function (err, data) {

      if (err) {
        self.emit('error', {
          name: self.name,
          error: 'fail_read_file'
        });
        self.wait = 1000;
      } else {

        let crcOk = data.match(/YES/g);

        if (crcOk) {
          let signal = data.match(/t=(\-?\d+)/i);
          let temperature = signal[1] / 1000.0;
          self.wait = 0;

          if (Number.parseInt(signal[1], 10) === 85000) {
            self.emit('error', {
              name: self.name,
              error: 'sensor_power_on'
            });
          } else if (temperature < self.sensorMin || temperature > self.sensorMax) {
            self.emit('error', {
              name: self.name,
              error: 'out_of_range'
            });
          } else {
            self.emit('data', {
              name: self.name,
              time: new Date(),
              temperature: temperature
            });
          }
        // crc not ok
        } else {
          self.emit('error', {
            name: self.name,
            error: 'crc_not_ok'
          });
          self.wait = 500;
        }

      }

      if (self.enabled) {
        setTimeout(function () {
          self._poll();
        }, self.wait);
      } else {
        self.emit('end', {
          name: self.name,
          error: 'disabled'
        });
      }

    });

  }

  startPolling() {
    this.enabled = true;

    this._poll();

  }

  stopPolling() {
    this.enabled = false;
  }

}

module.exports = Temperature;
