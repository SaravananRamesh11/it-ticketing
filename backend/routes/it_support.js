const express = require('express');
const router = express.Router();
const User=require("../models/User")
const {getOpenTicketsBySupport,close_ticket}=require("../controller/it_support")

router.post("/get_open",getOpenTicketsBySupport)
router.post("/close_ticket",close_ticket)

module.exports=router;
