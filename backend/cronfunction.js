// backend/controller/cronJob.js

const exportAndDeleteClosedTickets = require('./utils/exportTickets');
const ITSupportStats = require('./models/out_count.js');
const Ticket = require('./models/Ticket');
const sendEmail = require('./services/mailservice');

function isLastDayOfMonth(date = new Date()) {
  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1);
  return tomorrow.getMonth() !== date.getMonth();
}

async function runMonthlyMaintenance() {
  console.log('📦 Running automatic cron job for ticket export...');
  await exportAndDeleteClosedTickets();
  console.log('✅ Monthly ticket export & deletion complete.');
  await ITSupportStats.resetAllCounts();
  console.log('🧹 All IT support outOfTimeCount values reset to 0.');
}




//cronjob 2---------------------------------------------

async function sendInProgressTicketReminder() {
  console.log('📬 Running in-progress ticket reminder job...');

  try {
    // 1. Fetch all in-progress tickets
    const inProgressTickets = await Ticket.getInProgressTickets();

    if (!inProgressTickets.length) {
      console.log("📭 No in-progress tickets found.");
      return "No tickets";
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

    // 3. Send email
    const authorityEmail = process.env.HR || 'authority@example.com';
    await sendEmail(authorityEmail, '⏳ Reminder: In-Progress Tickets Summary', emailContent);

    console.log(`✅ Reminder email sent to ${authorityEmail}`);
    return "Email sent";
  } catch (err) {
    console.error('❌ Error in in-progress ticket reminder job:', err);
    throw err;
  }
}




module.exports = {
  isLastDayOfMonth,
  runMonthlyMaintenance,
  sendInProgressTicketReminder
};

