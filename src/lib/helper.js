'use strict';

const APIError = require('boilerplate/lib/error');
const fs = require('fs');
const path = require('path');


module.exports.serveImage = function(filePath, res, next) {
    let ext = path.extname(filePath);
    let contentType = '';

    switch (ext) {
        case '.gif':
            contentType = 'image/gif';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
        case '.jpeg':
            contentType = 'image/jpg';
            break;
        default:
            return res.status(404).end();
    }

    fs.readFile(filePath, (err, data) => {
        if (err)
            return next(new APIError('Böyle bir dosya yok.', 404));

        res.writeHead(200, {'Content-Type': contentType});
        res.end(data);
    });
};
