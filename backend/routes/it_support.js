const express = require('express');
const router = express.Router();
const User=require("../models/User")
const {getAssignedTicketsBySupport,close_ticket,updateTicketStatus}=require("../controller/it_support")
const {verifyToken}=require('../middleware/general')
const{checkSupport}=require('../middleware/support')

router.use(verifyToken, checkSupport);

router.post("/get_open",getAssignedTicketsBySupport)
router.post("/close_ticket",close_ticket)
router.put('/update_ticket_status', updateTicketStatus); 
module.exports=router;
