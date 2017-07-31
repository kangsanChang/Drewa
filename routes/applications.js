const express = require('express');
const router = express.Router();
const c = require('../controller/applications');


router.route('/').post(c.postApplications).get(c.getApplications);
router.route('/:userAuthIdx').get(c.getApplication);

module.exports = router;