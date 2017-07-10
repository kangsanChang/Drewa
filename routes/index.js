const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controller/authController');
const auth = authController.authenticate;

/* GET home page. */

const checkToken = (req, res, next) => {
    if (!req.user) {
        req.user = 'KKK'
    }
    res.json({status: req.user.userEmail});
};

const login = async (req, res, next) => {
    try {
        const token = await authController.createToken('hainco@gmail.com', '윤상현', '면접관');
        res.json({token: token});
    } catch (err) {
        next(err);
    }

};

router.get('/checkToken', auth, checkToken);
router.post('/login', login);


module.exports = router;
