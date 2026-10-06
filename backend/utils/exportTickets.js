const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { Parser } = require('json2csv');
const Ticket = require('../models/Ticket');
const r2 = require('../config/r2');

module.exports = async function exportAndDeleteClosedTickets() {
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const reportDate = new Date(lastDayOfMonth);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthName = monthNames[reportDate.getMonth()];
  const year = reportDate.getFullYear();

  const closedTickets = await Ticket.find({ status: 'Closed' });

  if (!closedTickets.length) {
    console.log('📭 No closed tickets to export.');
    return;
  }

  // ✅ Format the date field
  const formattedTickets = closedTickets.map(ticket => ({
    employeeName: ticket.employeeName,
    employeeId: ticket.employeeId,
    issue: ticket.issue,
    date: new Date(ticket.date).toISOString().split('T')[0], // ⬅ FIX
    time: ticket.time,
    email: ticket.email,
    itSupport: ticket.itSupport,
    resolution: ticket.resolution,
    status: ticket.status,
    proofImageKey: ticket.proofImageKey || '',
    proofImageUrl: ticket.proofImageUrl || '',
  }));

  const fields = [
    'employeeName', 'employeeId', 'issue', 'date',
    'time', 'email', 'itSupport', 'resolution', 'status',
    'proofImageKey', 'proofImageUrl'
  ];

  const parser = new Parser({ fields });
  const csv = parser.parse(formattedTickets); // use formatted data

  const fileName = `IT-TICKETING/tickets/tickets-${monthName.toLowerCase()}-${year}.csv`;

  const uploadParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
    Body: csv,
    ContentType: 'text/csv'
  };

  await r2.send(new PutObjectCommand(uploadParams));
  console.log(`✅ Uploaded to R2: ${fileName}`);

  await Ticket.deleteMany({ status: 'Closed' });
  console.log('🗑️ Deleted all closed tickets from MongoDB.');
};
