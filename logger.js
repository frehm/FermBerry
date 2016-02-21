'use strict';
const request = require('request');

class Logger {
  constructor(temperatureThreshold) {
    this.temperatureThreshold = temperatureThreshold;
    this.temperatures = new Map();
  }

  _postToInflux(measurement, data, callback) {
    let options = {
      headers: {
        'Content-Type': 'text/plain'
      },
      uri: 'http://localhost:8086/write?db=beer',
      body: `${measurement},sensor=${data.name} value=${data.temperature} ${data.time.getTime() * 1000000}`,
      method: 'POST'
    };

    request(options, (err, res, body) => {
      if (err || res.statusCode !== 204) return callback(new Error('Failed write to influx'));
      callback(null);
    });
  }

  _log(measurement, data) {
    //console.log('log', measurement, data);
    this._postToInflux(measurement, data, err => {
      if (err) console.error('post_err', err);
    });
  }

  temperature(data) {
    var oldData = this.temperatures.get(data.name);

    if (oldData) {
      // check if change over threshold
      if (data.temperature > oldData.temperature + this.temperatureThreshold ||
        data.temperature < oldData.temperature - this.temperatureThreshold) {

        this.temperatures.set(data.name, data);
        this._log('temperature', data);
      }

    } else {
      this.temperatures.set(data.name, data);
      this._log('temperature', data);
    }

  }

  output(data) {
    console.log('output', data);
  }
}

module.exports = Logger;
