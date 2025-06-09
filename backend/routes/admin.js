const express = require('express');
const router = express.Router();
const { register_user, getTicketStats, removeemployee, downloadCsvFromS3, previewCsvFromS3 } = require("../controller/admin");
const {checkAdmin}=require('../middleware/admin')
const {verifyToken}=require('../middleware/general')
router.use(verifyToken, checkAdmin);
router.post('/add_users', register_user);
router.get('/stats', getTicketStats);
router.post('/remove', removeemployee);
router.get('/download-csv', downloadCsvFromS3);
router.get('/preview-csv', previewCsvFromS3);

module.exports = router;



// const { register_user, getTicketStats, removeemployee } = require("../controller/admin");
// const express = require('express');
// const router = express.Router();

// const { getClosedTicketsFile } = require('../utils/s3Downloader'); // ⬅️ import the S3 utility

// // Existing routes
// router.post('/add_users', register_user);
// router.get("/stats", getTicketStats);
// router.post('/remove', removeemployee);

// // 🆕 New route: Download CSV from S3
// router.get('/download-csv', async (req, res) => {
//   const { month, year } = req.query;

//   if (!month || !year) {
//     return res.status(400).json({ error: 'Month and year are required' });
//   }

//   try {
//     const fileStream = await getClosedTicketsFile(month, year);

//     res.setHeader(
//       'Content-Disposition',
//       `attachment; filename="tickets-${month}-${year}.csv"`
//     );
//     res.setHeader('Content-Type', 'text/csv');

//     fileStream.pipe(res); // Stream S3 file to client
//   } catch (err) {
//     res.status(404).json({ error: err.message || 'Download failed' });
//   }
// });

// module.exports = router;
