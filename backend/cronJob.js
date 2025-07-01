require('dotenv').config();
const cron = require('node-cron');
const mongoose = require('mongoose');
const exportAndDeleteClosedTickets = require('./utils/exportTickets');
const Ticket = require('./models/Ticket'); // adjust path as needed
const sendEmail = require('./services/mailservice'); // adjust path as needed
const ITSupportStats = require('./models/out_count.js'); // adjust path as needed


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
       await ITSupportStats.resetAllCounts();
      console.log('🧹 All IT support outOfTimeCount values reset to 0.');
    } catch (error) {
      console.error('❌ Cron job error:', error);
    }
  }
});





// Schedule: Every 2 days at 10:30 AM
cron.schedule('30 10 */2 * *', async () => {
  console.log('📬 Running in-progress ticket reminder cron job...');

  try {
    // 1. Fetch all in-progress tickets using static function
    const inProgressTickets = await Ticket.getInProgressTickets();

    if (!inProgressTickets.length) {
      console.log("📭 No in-progress tickets found.");
      return;
    }

    // 2. Compose email content
    const ticketSummary = inProgressTickets.map(ticket => {
      return `- Ticket ID: ${ticket._id}
  Issue: ${ticket.issue?.main || ''} > ${ticket.issue?.sub || ''} > ${ticket.issue?.inner_sub || ''}
  Assigned To: ${ticket.itSupport || 'N/A'}
  Created At: ${ticket.createdAt?.toLocaleString()}
  Status: ${ticket.status}

`;
    }).join('\n');

    const emailContent = `Hello Authority,

The following tickets are still marked as *In Progress* as of ${new Date().toLocaleString()}:

${ticketSummary}

Please review and take necessary action.

- IT Support System`;

    // 3. Send email to authority
    const authorityEmail = process.env.HR || 'authority@example.com';
    await sendEmail(authorityEmail, '⏳ Reminder: In-Progress Tickets Summary', emailContent);

    console.log(`✅ Reminder email sent to ${authorityEmail}`);
  } catch (err) {
    console.error('❌ Error in in-progress ticket reminder job:', err);
  }
});

