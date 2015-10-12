'use strict';

class PidController {

  constructor(setpoint, kp, ki, kd) {
    this.setpoint = setpoint;
    this.kp = kp;
    this.ki = ki;
    this.kd = kd;
    this.outputMax = 2000; // Output is relay time in ms
    this.outputMin = 0;
    this.auto = false;

    this.measuredValue = 0;
    this.output = 0;
    this.lastTime = Date.now() - 1000;
    this.errSum = 0;
    this.ITerm = 0;
    this.relayStart = 0;
  }

  changeSetpoint(newSetpoint) {
    this.setpoint = newSetpoint;
  }

  setAuto() {
    // Initialize controller when starting
    this.lastTime = Date.now() - 1000;
    this.ITerm = this.output;

    if (this.ITerm > this.outputMax) {
      this.ITerm = this.outputMax;
    } else if (this.ITerm < this.outputMin) {
      this.ITerm = this.outputMin;
    }

    this.auto = true;
  }

  setManual() {
    this.auto = false;
  }

  setPID(p, i, d) {
    if (p) this.kp = p;
    if (i) this.ki = i;
    if (d) this.kd = d;
  }

  setOutputLimits(min, max) {
    if (min > max) return;

    this.outputMin = min;
    this.outputMax = max;

    // Clamp output to new limits
    if (this.output > this.outputMax) {
      this.output = this.outputMax;
    } else if (this.output < this.outputMin) {
      this.output = this.outputMin;
    }

    // Clamp ITerm to new limits
    if (this.ITerm > this.outputMax) {
      this.ITerm = this.outputMax;
    } else if (this.ITerm < this.outputMin) {
      this.ITerm = this.outputMin;
    }
  }

  calculate(newMeasuredValue) {


    if (!this.auto) {
      this.measuredValue = newMeasuredValue;
      this.lastTime = Date.now();
      return this.output;
    }

    // Time since last calculation
    var now = Date.now();
    var dTime = now - this.lastTime;

    if (dTime === 0) {
      return this.output;
    }

    // Compute errors
    var error = this.setpoint - newMeasuredValue;
    this.ITerm += ki * error * dTime;

    // Clamp ITerm at outputMin and outputMax to remove integral windup
    if (this.ITerm > this.outputMax) {
      this.ITerm = this.outputMax;
    } else if (this.ITerm < this.outputMin) {
      this.ITerm = this.outputMin;
    }

    var dMeasuredValue = (newMeasuredValue - this.measuredValue) / dTime; // Derivative on Measurement
    //var dErr = (error - this.lastErr) / dTime; // Derivative on Error

    // Compute output
    this.output = this.kp * error + this.ITerm - this.kd * dMeasuredValue; // Derivate on Measurement
    //this.output = this.kp * error + ki * errSum + kd * dErr; // Derivative on Error

    // Clamp output, as well, since P and D can move it outside bounds
    if (this.output > this.outputMax) {
      this.output = this.outputMax;
    } else if (this.output < this.outputMin) {
      this.output = this.outputMin;
    }

    this.lastTime = now;
    this.measuredValue = newMeasuredValue; // Derivative on Measurement
    //this.lastErr = error; // Derivate on Error

    // Shift relay on/off window
    if (now - this.relayStart > this.outputMax) {
      this.relayStart = now;
    }

    // Set relay to on if elapsed time in window is less than output
    return {
      output: this.output,
      relayOn: now - this.relayStart < this.output
    };
  }
}
