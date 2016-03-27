var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('boilerplate/lib/crypto'),
    _ = require('lodash'),
    updatableFields = ['name', 'email', 'birthDate', 'gender', 'isAdmin', 'permissions'];



var UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    salt: { type: String, required: true, default: crypto.generateRandomString.bind(null, 8) }
});


UserSchema.statics.defaultSelects = 'name email';


/**
 * Compare input with current password.
 * Add salt to input and take SHA256.
 *
 * @param password Input password.
 * @returns {boolean}
 */
UserSchema.methods.checkPassword = function(password) {
    return this.password === crypto.sha256(password + this.salt);
};

/**
 * Set current password.
 * Add default salt to input and take SHA256 hash.
 *
 * @param password User input.
 * @returns {UserSchema.methods}
 */
UserSchema.methods.setPassword = function(password) {
    this.password = crypto.sha256(password + this.salt);
    return this;
};


UserSchema.methods.updateFields = function(doc) {
    _.forEach(updatableFields, function(key) {
        this[key] = doc[key] || this[key];
    }, this);

    return this;
};


module.exports = mongoose.model('User', UserSchema);
