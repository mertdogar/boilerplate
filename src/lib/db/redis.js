'use strict';

const config = require('boilerplate/config');
const redis = module.exports.redis = require('redis').createClient({
    host: config.get('redis:host'),
    port: config.get('redis:port')
});

module.exports.connect = function() {
    return new Promise((resolve, reject) => {
        redis.on('ready', resolve);
        redis.on('error', reject);
    });
};
