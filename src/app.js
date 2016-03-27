'use strict';

const db = require('boilerplate/lib/db');
const asyncQ = require('async-q');
const logger = require('boilerplate/lib/logger');


db
    .connect()
    .then(() => {
        const app = require('boilerplate/app/index');
        return app.listenBound();
    })
    .catch((err) => {
        logger.error('Cannot boot API', err);
        process.exit(0);
    });
