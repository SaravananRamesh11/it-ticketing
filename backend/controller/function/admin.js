const Ticket = require('../../models/Ticket');
const User = require('../../models/User');
const { getClosedTicketsFile } = require('../../utils/s3Downloader.js'); 
const stream = require('stream');
//const ItSupportStats = require('../models/ItSupportStats');

async function calculateTicketStats(tickets) {
  const statsMap = {};

  tickets.forEach(ticket => {
    const memberId = ticket.itSupport || 'Unassigned';

    if (!statsMap[memberId]) {
      statsMap[memberId] = {
        name: memberId,
        Open: 0,
        Closed: 0,
        InProgress: 0,
        turnAroundTimes: []
      };
    }

    statsMap[memberId][ticket.status]++;

    if (ticket.status === 'Closed' && ticket.createdAt && ticket.updatedAt) {
      const tat = new Date(ticket.updatedAt) - new Date(ticket.createdAt);
      statsMap[memberId].turnAroundTimes.push(tat);
    }
  });

  return statsMap;
}

async function mapOutOfTimeStats(outOfTimeStats) {
  const outOfTimeMap = {};
  for (const entry of outOfTimeStats) {
    const user = await User.findById(entry.user).lean();
    if (user) {
      outOfTimeMap[user.employeeId] = entry.outOfTimeCount;
    }
  }
  return outOfTimeMap;
}

function buildFinalStats(statsMap, outOfTimeMap) {
  return Object.values(statsMap).map(member => {
    const totalClosed = member.Closed;
    const avgTAT = member.turnAroundTimes.length
      ? member.turnAroundTimes.reduce((acc, val) => acc + val, 0) / member.turnAroundTimes.length
      : 0;

    return {
      name: member.name,
      Open: member.Open,
      InProgress: member.InProgress,
      Closed: totalClosed,
      avgTurnAroundTime: (avgTAT / (1000 * 60 * 60)).toFixed(2), // hours
      outOfTimeCount: outOfTimeMap[member.name] || 0
    };
  });
}

// downloadcsv formm --------------------------------------------------------------------

// Core function: fetch CSV stream from S3
async function fetchCsvFile(month, year) {
  if (!month || !year) {
    throw new Error('Month and year are required');
  }
  const fileStream = await getClosedTicketsFile(month, year);
  return fileStream;
}

// Build headers for CSV download
function setCsvHeaders(res, month, year) {
  res.setHeader('Content-Disposition', `attachment; filename=tickets-${month}-${year}.csv`);
  res.setHeader('Content-Type', 'text/csv');
}

module.exports = { calculateTicketStats, mapOutOfTimeStats, buildFinalStats, fetchCsvFile, setCsvHeaders };