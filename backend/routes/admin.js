const {register_user,getTicketStats,removeemployee}=require("../controller/admin")
const express = require('express');
const router = express.Router();
router.post('/add_users', register_user);
router.get("/stats",getTicketStats)
router.post('/remove', removeemployee);
module.exports = router;