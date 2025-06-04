require('dotenv').config();
const cron = require('node-cron');
const mongoose = require('mongoose');
const exportAndDeleteClosedTickets = require('./utils/exportTickets');



// 🔁 Runs at 23:59 on 28–31 of every month, checks if it's last day

cron.schedule('59 23 28-31 * *', async () => {// runs every last day of the month at 23:59 to make it run every 2 sec use, */2 * * * * * *
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (tomorrow.getMonth() !== today.getMonth()) {
    console.log('📦 Running automatic cron job for ticket export...');
    try {
      await exportAndDeleteClosedTickets();
      console.log('✅ Monthly ticket export & deletion complete.');
    } catch (error) {
      console.error('❌ Cron job error:', error);
    }
  }
});
