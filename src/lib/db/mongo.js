const mongoose = require('mongoose');
const config = require('boilerplate/config');
mongoose.Promise = global.Promise;


exports.connect = function() {
    return new Promise((resolve, reject) => {
        const connection = mongoose.connect('mongodb://' + config.get('mongo:host') + '/' + config.get('mongo:db'));
        mongoose.connection.once('open', _ => { resolve(); });
        mongoose.connection.on('error', reject);
    });
};
