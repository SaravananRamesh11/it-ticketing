const express = require('express');
const router = express.Router();
const User=require("../models/User")
const {getAssignedTicketsBySupport,close_ticket,updateTicketStatus,time_exceeded,makezero,returnName}=require("../controller/it_support")
const {verifyToken}=require('../middleware/general')
const{checkSupport}=require('../middleware/support')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });


//router.use(verifyToken, checkSupport);
router.post("/get_open",getAssignedTicketsBySupport)
router.put('/update_ticket_status', updateTicketStatus); 
router.post('/close_ticket', upload.single('proofImage'), close_ticket);
router.post('/exceed',time_exceeded)
router.get('/zero',makezero)
router.post('/name',returnName)

module.exports=router;
