'use strict';

const sm = require('sitemap');
const router = require('express').Router();
const APIError = require('boilerplate/lib/error');
const config = require('boilerplate/config');
const auth = require('boilerplate/lib/auth');
const sitemap = sm.createSitemap({
    hostname: config.get('SITE_URL'),
    cacheTime: 600000,
    urls: [
        { url: '/', img: config.get('SITE_URL') + '/public/assets/logo.png' },
        { url: '/gallery' },
        { url: '/contact' }
    ]
});


router.get('/', function(req, res, next) {
    res.render('layout', res.locals);
});


router.get('/sitemap.xml', function(req, res) {
    sitemap.toXML(function(err, xml) {
        if (err)
            return res.status(500).end();

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    });
});


module.exports = router;
