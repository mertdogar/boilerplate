const APIError = require('boilerplate/lib/error');
const config = require('boilerplate/config');


/**
 * Ensure user is authenticated.
 *
 * @param req Request.
 * @param res Response.
 * @param next Callback function.
 *
 * @returns {*}
 */
exports.ensureAuthentication = function(req, res, next) {
    if (req.isAuthenticated())
        return next();

    next(new APIError('Bu işlemi yapabilmek için yetkiniz yok.', 401));
};


exports.ensureVerification = function(req, res, next) {
    if (!req.user || !req.user.isVerified)
        return next(new APIError('Bu işlemi yapabilmek için hesabınızı onaylamalısınız.', 401));

    next();
};


exports.ensureAdmin = function(req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin)
        return next();

    next(new APIError('Bu işlemi yapabilmek için yetkiniz yok.', 401));
};

exports.ensureOwnerByResourceName = function(resourceName) {
    return function ensureOwner(req, res, next) {
        if (!req.isAuthenticated())
            return next(new APIError('Bu işlemi yapabilmek için yetkiniz yok.', 401));

        if (req.user.isAdmin)
            return next();

        var resource = req.resources[resourceName];

        if (resource.creatorId != req.user.id)
            return next(new APIError('Bu işlemi yapabilmek için yetkiniz yok.', 403));

        next();
    }
};


exports.hasPermission = function(resourceName, permissionName) {
    return function ensureOwner(req, res, next) {
        if (!req.isAuthenticated() || !req.user)
            return next(new APIError('Bu işlemi yapabilmek için yetkiniz yok.', 401));

        if (req.user.isAdmin)
            return next();

        if (permissionName && req.user.permissions && req.user.permissions[permissionName])
            return next();

        if (resourceName) {
            var resource = req.resources[resourceName];
            if (resource.creator._id == req.user._id)
                return next();
        }

        next(new APIError('Bu işlemi yapabilmek için yetkiniz yok.', 403));
    }
};


exports.Permissions = {
    CAN_READ_ALL_PROJECTS: 'canReadAllProjects',
    CAN_REVIEW_PROJECTS: 'canReviewProjects',
    CAN_EDIT_PROJECTS: 'canEditProjects',
    CAN_EDIT_ORGANIZATIONS: 'canEditOrganizations',
    CAN_REVIEW_ORGANIZATION_CANDIDATES: 'canReviewOrganizationCandidates',
    CAN_EDIT_USERS: 'canEditUsers',
    CAN_EDIT_EVENTS: 'canEditEvents',
    CAN_REVIEW_COMMENTS: 'canReviewComments',
    CAN_EDIT_COMMENTS: 'canEditComments',
    CAN_EDIT_ANNOUNCEMENTS: 'canEditAnnouncements',
    CAN_RECEIVE_CONTACT_MAILS: 'canReceiveContactMails',
    CAN_EDIT_UNIVERSITIES: 'canEditUniversities'
};
