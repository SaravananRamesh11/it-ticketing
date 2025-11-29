const express = require('express');
const router = express.Router();
const { register_user, getTicketStats, removeemployee, downloadCsvFromS3, previewCsvFromS3, getOutOfTimeCount, downloadRangeCsvFromS3 } = require("../controller/admin");
const {checkAdmin}=require('../middleware/admin')
const {verifyToken}=require('../middleware/general')

//router.use(verifyToken, checkAdmin);

router.post('/add_users', register_user);
router.get('/stats', getTicketStats);
router.post('/remove', removeemployee);
router.get('/download-csv', downloadCsvFromS3);
router.get('/preview-csv', previewCsvFromS3);
router.get('/download-range-csv', downloadRangeCsvFromS3);
router.post('/outoftime',getOutOfTimeCount)

module.exports = router;    



