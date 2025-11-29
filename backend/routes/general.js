const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const{login,getdetails,password,sendOTP,verifyOTP,resetPassword}  = require('../controller/general.js');
const {verifyToken}=require('../middleware/general')

router.use(verifyToken);

router.post("/details",getdetails)
router.post("/password",password)

module.exports = router;