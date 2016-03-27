"use strict";

const router = require('express').Router();
const crypto = require('boilerplate/lib/crypto');
const _ = require('lodash');
const APIError = require('boilerplate/lib/error');
const passport = require('passport');
const auth = require('boilerplate/lib/auth');
const config = require('boilerplate/config');
const User = require('./model');
const Helper = require('boilerplate/lib/helper');
const Lister = require('boilerplate/lib/lister');
const lister = new Lister({model: User});
const logger = require('boilerplate/lib/logger');

router.param('userId', function(req, res, next, id) {
    User
        .findById(id)
        .exec()
        .then((user) => {
            if (!user)
                return next(new APIError('Kullanıcı bulunamadı.', 404));

            req.resources = req.resources || {};
            req.resources.user = user;
            next();
        })
        .catch(next);
});


router.get('/',
    function(req, res, next) {
        let selectedFields = 'name';
        if (req.isAuthenticated() &&
            (req.user.isAdmin || req.user.hasPermission(auth.Permissions.CAN_EDIT_USERS))) {
            selectedFields = User.defaultSelects;
        }

        lister
            .list({
                query: req.query,
                select: selectedFields
            })
            .then((list) => {
                res.json(list);
            })
            .catch(next);
});


router.get('/report',
    auth.hasPermission(null, auth.Permissions.CAN_EDIT_USERS),
    function(req, res, next) {
        res.setHeader('content-type', 'text/csv');
        User
            .find({})
            .exec()
            .then((data) => {
                User.csvReadStream(data).pipe(res);
            })
            .catch(next);
});


/**
 * Sends activation email.
 */
router.post('/:userId/activation-mail',
    auth.ensureAuthentication,
    function(req, res, next) {
        if (!req.user.isAdmin &&
            req.user.hasPermission(auth.Permissions.CAN_EDIT_USERS))
            return next(new APIError('Bu işlemi yerine getirmeye yetkiniz yok.', 401));

        if (req.resources.user.isVerified)
            return next(new APIError('Bu kullanıcı zaten onaylanmış.', 400));

        Mail.sendEmailVerification(req.resources.user.email, {
            NAME: req.resources.user.name,
            VERIFICATIONLINK: config.get('API_URL') + '/api/users/verification/' + req.resources.user.verificationToken
        })
        .then(() => {
            res.status(201).end();
        })
        .catch(next);
});


/**
 * Sends reset password link.
 */
router.post('/reset-password-token',
    function(req, res, next) {
        if (!req.body.email)
            return next(new APIError('Lütfen e-posta adresi girin.', 400));

        User
            .findOne({email: req.body.email})
            .exec()
            .then((user) => {
                if (!user)
                    throw new APIError('Bu e-posta adresini kullanan bir kullanıcı bulunamadı.', 400);

                let resetToken = crypto.generateRandomString(32);
                user.resetPasswordToken = resetToken;

                return user
                    .save()
                    .then(() => {
                        let link = res.locals.SITE_URL + '/reset-password/' + resetToken;

                        return Mail.sendResetPasswordToken(user.email, {
                            NAME: user.name,
                            RESETLINK: link
                        })
                        .catch((err) => {
                            logger.error('Error while resetting password', err);
                        });
                    })
                    .then(() => {
                        res.status(201).end();
                    });
            })
            .catch(next);
});


/**
 * Resets user's password with new password.
 */
router.post('/reset-password',
    function(req, res, next) {
        let resetToken = req.body.token || req.query.token;
        let newPassword = req.body.newPassword || req.query.newPassword;

        if (!resetToken)
            return next(new APIError('Hatalı link.', 400));

        if (!newPassword)
            return next(new APIError('Lütfen yeni şifrenizi girin.', 400));

        User
            .findOne({resetPasswordToken: resetToken})
            .exec()
            .then((user) => {
                if (!user)
                    throw new APIError('Hatalı link.', 400);

                user.resetPasswordToken = undefined;
                user.setPassword(newPassword);

                return user
                    .save()
                    .then(() => {
                        res.status(200).end();
                    });
            })
            .catch(next);
});


/**
 * Create user path.
 */
router.post('/', function(req, res, next) {
    var user = req.body;

    if (!user.email || !user.password || !user.name || !user.birthDate)
        next(new APIError('Lütfen gerekli alanları doldurun.', 400));

    new User({
        name: user.name,
        email: user.email,
        birthDate: user.birthDate,
        gender: user.gender || 'not-specified',
        type: 'local',
        verificationToken: crypto.generateRandomString.bind(null, 32)()
    })
    .setPassword(user.password)
    .save()
    .then((user) => {
        res.json(user);
        return user;
    })
    .then((user) => {
        return Mail.sendEmailVerification(user.email, {
            NAME: user.name,
            VERIFICATIONLINK: config.get('API_URL') + '/api/users/verification/' + user.verificationToken
        })
        .catch((err) => {
            logger.error('Error while registering', err);
        });
    })
    .catch(next);
});


/**
 * Updates user's password.
 */
router.put('/:userId/password',
    auth.ensureAuthentication,
    function(req, res, next) {
        if (!req.user.isAdmin &&
            req.user._id != req.resources.user._id &&
            !req.user.hasPermission(auth.Permissions.CAN_EDIT_USERS))
            return next(new APIError('Bu işlemi gerçekleştirmek için yetkiniz yok.', 401));

        // If changing own password, require old password
        if (req.user._id == req.resources.user._id) {
            if (!req.body.oldPassword)
                return next(new APIError('Lütfen mevcut şifrenizi girin.', 400));

            if (!req.resources.checkPassword(req.body.oldPassword))
                return next(new APIError('Mevcut şifreniz doğru değil.', 400));
        }

        if (!req.body.newPassword)
            return next(new APIError('Lütfen yeni şifrenizi girin.', 400));

        req.resources
            .user
            .setPassword(req.body.newPassword)
            .save()
            .then(() => {
                res.status(200).end();
            })
            .catch(next);
});


/**
 * Updates user.
 * Only following fields can be updated:
 *     'name', 'email', 'birthDate', 'gender'
 *
 */
router.put('/:userId',
    auth.ensureAuthentication,
    function(req, res, next) {
        let user = req.resources.user;

        if (!req.user.isAdmin) {
            delete req.body.permissions;
            delete req.body.isAdmin;
        }

        if (!req.user.isAdmin &&
            req.user._id != user._id &&
            !req.user.hasPermission(auth.Permissions.CAN_EDIT_USERS))
            return next(new APIError('Bu işlemi gerçekleştirmek için yetkiniz yok.', 401));

        if (req.user.isAdmin && req.body.silentVerification) {
            req.resources.user.isVerified = true;
            req.resources.user.verificationToken = undefined;
        }

        if (req.body.avatarUrl)
            req.resources.user.avatarUrl = req.body.avatarUrl;

        req.resources
            .user
            .updateFields(req.body)
            .save()
            .then(res.json.bind(res))
            .catch(next);
});


/**
 * Current user.
 */
router.get('/current', function(req, res) {
    if (req.isAuthenticated())
        return res.json(req.user);

    res.json({});
});


/**
 * Logout path.
 */
router.get('/logout', auth.ensureAuthentication, function(req, res) {
    req.logout();
    res.redirect('/admin');
});


/**
 * Get user by id.
 */
router.get('/:userId',
    (req, res, next) => {
        let user = req.resources.user.toObject();
        let selectedFields = User.defaultSelects.split(' ').concat(['_id'])

        if (req.isAuthenticated() && req.user.isAdmin) {
            selectedFields.push('permissions');
            selectedFields.push('isAdmin');
        }

        res.json(_.pick(user, selectedFields));
});


/**
 * Get organisations by user id.
 */
router.get('/:userId/organisations',
    (req, res, next) => {
        let user = req.resources.user.toObject();
        GraphManager.getUserOrganizations(user._id)
            .then(function(response) {
                res.json(response);
            });
});


/**
 * Get user's avatar image.
 */
router.get('/:userId/avatar',
    (req, res, next) => {
        let filePath = req.resources.user.avatarUrl ||
            'img/default-user-avatar.png';

        Helper.serveImage(filePath, res, next);
});


/**
 * Only an administrator can delete a user.
 */
router.delete('/:userId',
    auth.hasPermission(null, auth.Permissions.CAN_EDIT_USERS),
    function(req, res, next) {
        req.resources
            .user
            .remove()
            .then(() => {
                res.status(200).end();
            })
            .catch(next);
});


/**
 * Login path. Returns current user if client accepts json.
 */
router.post('/login', passport.authenticate('local'), function(req, res, next) {
    if (req.accept && req.accept('json') || req.query.json == 'true')
        return res.json(req.user);

    res.status(200).end();
});


/**
 * Email verification handler.
 */
router.get('/verification/:code', function(req, res, next) {
    User
        .findOne({verificationToken: req.params.code})
        .exec()
        .then((user) => {
            if (!user)
                throw new APIError('Hatalı onay kodu.', 400);

            user.isVerified = true;
            user.verificationToken = undefined;

            return user.save();
        })
        .then((user) => {
            res.redirect(config.get('SITE_URL'));

            Mail.sendWelcome(user.email, {
                NAME: user.name,
                EMAIL: user.email
            })
            .catch((err) => {
                logger.error('Could not send welcome mail', err);
            });
        })
        .catch(next);
});


module.exports = router;
