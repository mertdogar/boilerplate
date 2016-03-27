"use strict";

const config = require('boilerplate/config');
const APIError = require('boilerplate/lib/error');
const dumpLevel = APIError.Levels.indexOf(config.get('components:errorHandler:dump'));
const logger = require('boilerplate/lib/logger');


module.exports = function(err, req, res, next) {
    let shownError = {message: 'Server error'};

    if (err instanceof APIError) {
        shownError = err;
    } else if (err instanceof Error) {
        shownError = {message: err.toString()};
    }

    if ((err.level || 3) >= dumpLevel)
        logger.error('APIError', err);

    shownError.level = APIError.Levels[err.level || 3];
    res.status(err.status || 500);
    delete shownError.status;

    res.json({ error: shownError, now: Date.now() }).end();
};
