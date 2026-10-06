const express = require('express');
const router = express.Router();
const { isLastDayOfMonth, runMonthlyMaintenance, sendInProgressTicketReminder } = require('../cronfunction');

// Vercel Cron sends "Authorization: Bearer <CRON_SECRET>" automatically
const requireCronSecret = (req, res, next) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Scheduled on days 28-31; only does work on the actual last day of the month
router.get('/monthly', requireCronSecret, async (req, res) => {
  try {
    if (!isLastDayOfMonth(new Date())) {
      return res.json({ skipped: true, reason: 'not last day of month' });
    }
    await runMonthlyMaintenance();
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Monthly cron error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Scheduled daily; only sends on every 2nd day (matches the old "*/2" day-of-month cron)
router.get('/reminder', requireCronSecret, async (req, res) => {
  try {
    if ((new Date().getUTCDate() - 1) % 2 !== 0) {
      return res.json({ skipped: true, reason: 'off day' });
    }
    const result = await sendInProgressTicketReminder();
    res.json({ success: true, result });
  } catch (error) {
    console.error('❌ Reminder cron error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
