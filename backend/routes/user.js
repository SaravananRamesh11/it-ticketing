

const express = require('express');
const router = express.Router();
const {ticket,password} = require('../controller/user');
const {verifyToken}=require('../middleware/general')
const{checkUser}=require("../middleware/user")

router.use(verifyToken,checkUser);
// Submit a ticket
router.post('/ticket', ticket);

router.put('/password',password);

module.exports = router;