'use strict';

const events = require('events');

class Temperature extends events.EventEmitter {
  constructor(path, name) {
    super();

    this.path = path;
    this.name = name;
    this.sensorMin = -55;
    this.sensorMax = 125;
    this.enabled = false;
    this.wait = 1000;
  }

  _poll() {
    const self = this;

    let t = Math.random() * 20 + 20;

    self.emit('data', {
      name: self.name,
      time: new Date(),
      temperature: t
    });


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
