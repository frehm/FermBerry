'use strict';

class Logger {
  constructor(temperatureThreshold) {
    this.temperatureThreshold = temperatureThreshold;
    this.temperatures = new Map();
  }

  _log(measurement, data) {
    console.log('log', measurement, data);
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
