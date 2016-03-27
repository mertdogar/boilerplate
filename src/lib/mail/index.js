"use strict";

const config = require('boilerplate/config');
const email = require('powerdrill')(config.get('mandrill:key'));

class Manager {
    constuctor() {

    }

    /**
     * Sends mail
     * @param {string} to Receiver
     * @param {string} subject Mail subject
     * @param {string} html Mail body
     *
     * @returns {Promise}
     */
    sendMail(to, template, params) {
        return new Promise((resolve, reject) => {
            var message = email(template);

            message
                .globalMergeVar(params)
                .trackClicks(true)
                .trackOpens(true)
                .to(to)
                .send((err, response) => {
                    if (err) return reject(err);
                    resolve(response);
                });
        });
    }

    /**
     * @param {string} to
     * @param {Object<VERIFICATIONLINK,NAME>} params
     */
    sendEmailVerification(to, params) {
        return this.sendMail(to, 'userverification', params);
    }

    /**
     * @param {string} to
     * @param {Object<NAME>} params
     */
    sendWelcome(to, params) {
        return this.sendMail(to, 'userwelcome', params);
    }

    /**
     * @param {string} to
     * @param {Object<RESETLINK,NAME>} params
     */
    sendResetPasswordToken(to, params) {
        return this.sendMail(to, 'resetpassword', params);
    }

    /**
     * @param {string} to
     * @param {Object<RESETLINK,NAME>} params
     */
    sendTicket(to, params) {
        return this.sendMail(to, 'ticket', params);
    }


    /**
     * @param {string} to
     * @param {Object<NAME>} params
     */
    sendProjectRejected(to, params) {
        return this.sendMail(to, 'projectrejected', params);
    }


    /**
     * @param {string} to
     * @param {Object<NAME>} params
     */
    sendProjectApproved(to, params) {
        return this.sendMail(to, 'projectapproved', params);
    }


    /**
     * @param {string} to
     * @param {Object<NAME,ORGANISATIONNAME>} params
     */
    sendOrganisationApproved(to, params) {
        return this.sendMail(to, 'organisationapproved', params);
    }


    /**
     * @param {string} to
     * @param {Object<NAME,ORGANISATIONNAME>} params
     */
    sendOrganisationRejected(to, params) {
        return this.sendMail(to, 'organisationrejected', params);
    }
};


module.exports = new Manager();
