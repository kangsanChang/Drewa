const express = require('express');
const router = express.Router();
const a = require('../controller/applicant');
const auth = require('../controller/authController');


router.route('/login').post(a.postLogin);
router.route('/signup').post(a.postSignUp);
router.route('/verify').get(auth.authenticate, a.tokenVerify);

module.exports = router;
