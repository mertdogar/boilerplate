"use strict";

const winston = require('winston');
const config = require('boilerplate/config');


winston.add(winston.transports.File, { filename: config.get('log') });

module.exports = winston;
