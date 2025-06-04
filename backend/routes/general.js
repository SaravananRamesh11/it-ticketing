const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const{login,getdetails,password}  = require('../controller/general.js');

router.post('/login',login );
router.post("/details",getdetails)
router.post("/password",password)


module.exports = router;