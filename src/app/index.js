'use strict';

const _ = require('lodash');
const config = require('boilerplate/config');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('boilerplate/lib/db/redis').redis;
const cors = require('express-cors');
const redisStore = new RedisStore({ client: redis });
const User = require('boilerplate/components/user/model');
const auth = require('boilerplate/lib/auth');
const APIError = require('boilerplate/lib/error');
const logger = require('boilerplate/lib/logger');


/* Extend lodash */
_.mixin(require('lodash-deep'));


/**
 * Initialize local strategy for logging in.
 */
passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    (email, password, done) => {
        User.findOne({ email: email }, function(err, user) {
            if (err) return done(err);
            if (user && user.checkPassword(password)) return done(null, user);

            return done(new APIError('user not found', 404), false);
        });
    }
));


var API_URL = config.get('API_URL') + '/api/';
var SITE_URL = config.get('SITE_URL');


app.locals.meta = {
    'title': 'Boilerplate',
    'description': 'Boilerplate description.',
    'keywords': 'boilerplate, angularjs, web',
    'share': {
        'title': 'Boilerplate',
        'image': SITE_URL + '/public/assets/share/share.jpg',
        'site': SITE_URL,
        'description': 'Boilerplate description.'
    }
}

/**
 * Necessary for PassportJS to work.
 */
passport.serializeUser((user, done) => { done(null, user.id); });

/**
 * Necessary for PassportJS to work.
 */
passport.deserializeUser((id, done) => { User.findById(id, done); });

app.use(require('prerender-node').set('prerenderToken', 'Hdr2TUO424DtiEW1ZgX1'));

app.enable('trust proxy');
app.disable('x-powered-by');

app.set('views', 'src/views');
app.set('view engine', 'jade');

app.use(cors({allowedOrigins: [config.get('cors')]}));

app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(session({
    secret: config.get('session-secret'),
    proxy: true,
    cookie: {
        maxAge: 365 * 24 * 60 * 60
    },
    resave: true,
    saveUninitialized: true,
    store: redisStore
}));
app.use(passport.initialize());
app.use(passport.session());


app.use(function(req, res, next) {
    res.locals.API_URL = API_URL;
    res.locals.API_URL_PLAIN = config.get('API_URL');
    res.locals.SITE_URL = SITE_URL;
    res.locals.PERMISSIONS = auth.Permissions;
    res.locals.PERMISSIONS_ARRAY = _.pairs(auth.Permissions);
    next();
});

/**
 * Routing.
 */
app.use('/public', express.static(__dirname + '/../public'));
app.use('/', require('boilerplate/app/routes'));
app.use(require('boilerplate/lib/handlers/error'));

User.findOne({ email: 'test@boilerplate.com'}).exec(function(err, user) {
    if (err) return logger.warn('Error while checking existence of test user ', err);
    if (user) return;

    new User({
        name: 'test user',
        email: 'test@boilerplate.com',
        birthDate: Date.now(),
        gender: 'male',
        isActive: true,
        isAdmin: true,
        type: 'local'
    })
        .setPassword('asdf123')
        .save(function(err, user) {
            if (err) logger.warn('Cannot add test user', err);
        });
});


app.listenBound = function() {
    return new Promise((resolve, reject) => {
        server.listen(config.get('http:port'), function(err) {
            if (err) return reject(err);

            resolve();
            logger.info('API booted successfully');
        });
    });
};


module.exports = app;
