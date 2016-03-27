const express = require('express');
const router = express.Router();


router.use('/', require('boilerplate/components/base/controller'));
router.use('/api/users', require('boilerplate/components/user/controller'));


module.exports = router;
