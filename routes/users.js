const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const auth = authController.authenticate;

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

module.exports = router;
