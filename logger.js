'use strict';
const request = require('request');
const config = require('./config.json');

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
      uri: `${config.database.host}/write?db=${config.database.db}&precision=ms`,
      body: `${measurement},sensor=${data.name} value=${data.temperature} ${data.time.getTime()}`,
      method: 'POST'
    };

    request(options, (err, res, body) => {
      if (err || res.statusCode !== 204) return callback(new Error('Failed write to influx'));
      callback(null);
    });
  }

  _log(measurement, data) {
    this._postToInflux(measurement, data, err => {
      if (err) console.error('post_err', err);
    });
  }

  temperature(data) {
    this._log('temperature', data);
    /*
    const oldData = this.temperatures.get(data.name);

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
    }*/

  }

  output(data) {
    console.log('output', data);
  }
}

module.exports = Logger;
