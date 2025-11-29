const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Number of salt rounds for bcrypt
const Ticket=require("../models/Ticket")
const { getClosedTicketsFile } = require('../utils/s3Downloader');
const csv = require('csv-parser'); 
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const ItSupportStats = require('../models/out_count.js');

const {calculateTicketStats,mapOutOfTimeStats,buildFinalStats,fetchCsvFile,setCsvHeaders}=require('./function/admin.js')

// Create S3 client
const s3 = new S3Client({ region: process.env.AWS_REGION });

// Add new employee endpoint with password hashing
const register_user = async (req, res) => {
  try {
    const { employeeId, employeeName, password, role, email } = req.body;

    console.log(req.body);
    console.log(`${employeeId},${employeeName}, ${password}, ${role},${email}`);

    // Basic validation
    if (!employeeId || !employeeName || !password || !role || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if employee ID already exists
    const existingUserById = await User.findOne({ employeeId });
    if (existingUserById) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    // Check if email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new employee with hashed password
    const newEmployee = new User({
      employeeName,
      employeeId,
      email,
      role,
      password: hashedPassword // Store the hashed password
    });

    // Save to database
    const savedEmployee = await newEmployee.save();

    // Return response (without password)
    const { password: _, ...employeeData } = savedEmployee.toObject();
    res.status(201).json({
      message: 'User added successfully',
      employee: employeeData
    });

  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST or DELETE to /delete-user
const removeemployee = async (req, res) => {
  const { employeeId } = req.body;

  if (!employeeId) {
    return res.status(400).json({ message: 'employeeId is required' });
  }

  try {
    const result = await User.findOneAndDelete({ employeeId });

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User with employeeId ${employeeId} deleted successfully` });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get ticket statistics for IT support members
async function getTicketStats(req, res) {
  try {
    const tickets = await Ticket.find({});
    const statsMap = await calculateTicketStats(tickets);

    const outOfTimeStats = await ItSupportStats.find({}).lean();
    const outOfTimeMap = await mapOutOfTimeStats(outOfTimeStats);

    const stats = buildFinalStats(statsMap, outOfTimeMap);

    res.status(200).json(stats);
  } catch (error) {
    console.error("❌ Error in getTicketStats:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

// Download CSV from S3
async function downloadCsvFromS3(req, res) {
  try {
    const { month, year } = req.query;
    const fileStream = await fetchCsvFile(month, year);
    setCsvHeaders(res, month, year);
    fileStream.pipe(res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(404).json({ error: error.message || 'File not found or failed to download' });
  }
}

// Helper function to convert stream to string
const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });

// Helper function to get all months between FROM and TO (inclusive)
function getMonthsInRange(fromMonth, fromYear, toMonth, toYear) {
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  const fromIndex = months.indexOf(fromMonth.toLowerCase());
  const toIndex = months.indexOf(toMonth.toLowerCase());
  
  if (fromIndex === -1 || toIndex === -1) {
    throw new Error('Invalid month name');
  }
  
  const monthYearPairs = [];
  let currentYear = parseInt(fromYear);
  let currentMonthIndex = fromIndex;
  const endYear = parseInt(toYear);
  const endMonthIndex = toIndex;
  
  while (currentYear < endYear || (currentYear === endYear && currentMonthIndex <= endMonthIndex)) {
    monthYearPairs.push({
      month: months[currentMonthIndex],
      year: currentYear.toString()
    });
    
    currentMonthIndex++;
    if (currentMonthIndex >= 12) {
      currentMonthIndex = 0;
      currentYear++;
    }
  }
  
  return monthYearPairs;
}

// Download consolidated CSV for date range
const downloadRangeCsvFromS3 = async (req, res) => {
  try {
    const { fromMonth, fromYear, toMonth, toYear } = req.query;
    
    if (!fromMonth || !fromYear || !toMonth || !toYear) {
      return res.status(400).json({ error: 'fromMonth, fromYear, toMonth, and toYear are required' });
    }
    
    // Get all months in range
    const monthYearPairs = getMonthsInRange(fromMonth, fromYear, toMonth, toYear);
    
    if (monthYearPairs.length === 0) {
      return res.status(400).json({ error: 'Invalid date range' });
    }
    
    console.log(`📥 Downloading range CSV for ${monthYearPairs.length} months`);
    
    // Fetch and parse all CSV files using csv-parser
    const allRows = [];
    let headers = [];
    let headersSet = false;
    
    for (const { month, year } of monthYearPairs) {
      try {
        const fileStream = await getClosedTicketsFile(month, year);
        const rows = [];
        
        await new Promise((resolve, reject) => {
          fileStream
            .pipe(csv())
            .on('data', (data) => {
              rows.push(data);
            })
            .on('end', () => {
              resolve();
            })
            .on('error', (err) => {
              reject(err);
            });
        });
        
        if (rows.length > 0) {
          // Set headers from first file
          if (!headersSet) {
            headers = Object.keys(rows[0]);
            headersSet = true;
          }
          
          // Add all rows
          allRows.push(...rows);
          console.log(`✅ Loaded ${rows.length} rows from ${month}-${year}`);
        }
      } catch (error) {
        console.warn(`⚠️ Skipping ${month}-${year}: ${error.message}`);
        // Continue with other files even if one fails
      }
    }
    
    if (allRows.length === 0) {
      return res.status(404).json({ error: 'No data found in the specified range' });
    }
    
    // Convert to CSV string using proper CSV formatting
    let csvString = headers.join(',') + '\n';
    
    allRows.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Handle values with commas, quotes, or newlines by wrapping in quotes
        if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
          return `"${String(value).replace(/"/g, '""')}"`;
        }
        return String(value);
      });
      csvString += values.join(',') + '\n';
    });
    
    // Set response headers
    const filename = `tickets-${fromMonth.toLowerCase()}-${fromYear}-to-${toMonth.toLowerCase()}-${toYear}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'text/csv');
    
    // Send the consolidated CSV
    res.send(csvString);
    
    console.log(`✅ Consolidated CSV sent: ${allRows.length} rows from ${monthYearPairs.length} files`);
    
  } catch (error) {
    console.error('❌ Error downloading range CSV:', error);
    res.status(500).json({ error: error.message || 'Failed to download range CSV' });
  }
};

// Preview CSV from S3 with signed URLs
const previewCsvFromS3 = async (req, res) => {
  try {
    const { month, year } = req.query;
    console.log(`🔍 Preview request forr: ${month}, ${year}`);
    
    console.log("DATAAAAAAAAAAAAAAAAAA");
    const fileStream = await getClosedTicketsFile(month, year);
    const rawRows = [];

    fileStream
      .pipe(csv())
      .on('data', (data) => {
        rawRows.push({ ...data }); // just collect data first
      })
      .on('end', async () => {
        const results = [];

        for (const row of rawRows) {
          if (row.proofImageKey) {
            try {
              const command = new GetObjectCommand({
                Bucket: process.env.BUCKET_NAME,
                Key: row.proofImageKey
              });

              row.proofImageUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
            } catch (err) {
              console.warn(`⚠️ Could not sign URL for ${row.proofImageKey}:`, err.message);
              row.proofImageUrl = null;
            }
          }

          results.push(row);
        }

        console.log(`✅ Parsed and signed ${results.length} rows`);
        res.json(results);
      })
      .on('error', (err) => {
        console.error('❌ CSV parse error:', err);
        res.status(500).json({ error: 'CSV parsing failed' });
      });

  } catch (err) {
    console.error('❌ Error fetching from S3:', err);
    res.status(404).json({ error: 'CSV file not found or unreadable' });
  }
};

// Get out-of-time ticket count for a specific user
const getOutOfTimeCount = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required in the request body' });
  }

  try {
    const stats = await ITSupportStats.findOne({ user: userId });

    if (!stats) {
      return res.status(404).json({ success: false, message: 'Stats not found for this user' });
    }

    return res.status(200).json({
      success: true,
      userId: userId,
      itSupportName: stats.itSupportName,
      outOfTimeCount: stats.outOfTimeCount
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register_user, getTicketStats, removeemployee, downloadCsvFromS3, previewCsvFromS3, getOutOfTimeCount, downloadRangeCsvFromS3 };







// const getTicketStats = async (req, res) => {
//   try {
//     console.log('this is sarva basically testing',req.body)
//     const tickets = await Ticket.find({});
//     const statsMap = {};

//     // 1. Group tickets by itSupport (assume it's employeeId)
//     tickets.forEach(ticket => {
//       const memberId = ticket.itSupport || 'Unassigned';

//       if (!statsMap[memberId]) {
//         statsMap[memberId] = {
//           name: memberId, // This is employeeId
//           Open: 0,
//           Closed: 0,
//           InProgress: 0,
//           turnAroundTimes: []
//         };
//       }

//       statsMap[memberId][ticket.status]++;

//       if (ticket.status === 'Closed' && ticket.createdAt && ticket.updatedAt) {
//         const tat = new Date(ticket.updatedAt) - new Date(ticket.createdAt);
//         statsMap[memberId].turnAroundTimes.push(tat);
//       }
//     });

//     // 2. Fetch outOfTime stats (assumes 'user' is the ObjectId ref to User)
//     const outOfTimeStats = await ItSupportStats.find({}).lean();

//     // 3. Map user _id → outOfTimeCount
//     const outOfTimeMap = {};
//     for (const entry of outOfTimeStats) {
//       const user = await User.findById(entry.user).lean();
//       if (user) {
//         outOfTimeMap[user.employeeId] = entry.outOfTimeCount;
//       }
//     }

//     // 4. Build final response
//     const stats = Object.values(statsMap).map(member => {
//       const totalClosed = member.Closed;
//       const avgTAT = member.turnAroundTimes.length
//         ? member.turnAroundTimes.reduce((acc, val) => acc + val, 0) / member.turnAroundTimes.length
//         : 0;

//       return {
//         name: member.name,
//         Open: member.Open,
//         InProgress: member.InProgress,
//         Closed: totalClosed,
//         avgTurnAroundTime: (avgTAT / (1000 * 60 * 60)).toFixed(2), // ms → hours
//         outOfTimeCount: outOfTimeMap[member.name] || 0
//       };
//     });

//     res.status(200).json(stats);
//   } catch (error) {
//     console.error("❌ Error in getTicketStats:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };


// const downloadCsvFromS3 = async (req, res) => {
//   try {
//     const { month, year } = req.query;

//     if (!month || !year) {
//       return res.status(400).json({ error: 'Month and year are required' });
//     }

//     // const fileKey = `IT-TICKETING/tickets-${month.toLowerCase()}-${year}.csv`;
//     // const fileStream = await getS3FileStream(fileKey);
//     const fileStream = await getClosedTicketsFile(month, year);

//     res.setHeader('Content-Disposition', `attachment; filename=tickets-${month}-${year}.csv`);
//     res.setHeader('Content-Type', 'text/csv');

//     fileStream.pipe(res);
//   } catch (error) {
//     console.error('❌ Error:', error);
//     res.status(404).json({ error: 'File not found or failed to download' });
//   }
// };
