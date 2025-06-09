const {login,sendOTP,verifyOTP,resetPassword}=require("../controller/login")
const express = require('express');
const router = express.Router();

router.post('/login',login );
router.post("/requestotp",sendOTP)
router.post("/verifyotp",verifyOTP)
router.post("/resetpassword",resetPassword)
module.exports = router;