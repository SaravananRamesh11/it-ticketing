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
// Create S3 client
const s3 = new S3Client({ region: process.env.AWS_REGION });
// Add new employee endpoint with password hashi
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
const getTicketStats = async (req, res) => {
  try {
    const tickets = await Ticket.find({});
    const statsMap = {};

    // Step 1: Group tickets by IT support member
    tickets.forEach(ticket => {
      const member = ticket.itSupport || 'Unassigned';

      if (!statsMap[member]) {
        statsMap[member] = {
          name: member,
          Open: 0,
          Closed: 0,
          InProgress: 0,
          turnAroundTimes: []
        };
      }

      statsMap[member][ticket.status]++;

      // Step 2: Calculate TAT only for closed tickets
      if (ticket.status === 'Closed' && ticket.createdAt && ticket.updatedAt) {
        const tat = new Date(ticket.updatedAt) - new Date(ticket.createdAt); // milliseconds
        statsMap[member].turnAroundTimes.push(tat);
      }
    });

    // Step 3: Prepare the final response with TAT
    const stats = Object.values(statsMap).map(member => {
      const totalClosed = member.Closed;
      const avgTAT = member.turnAroundTimes.length
        ? member.turnAroundTimes.reduce((acc, val) => acc + val, 0) / member.turnAroundTimes.length
        : 0;

      return {
        name: member.name,
        Open: member.Open,
        InProgress: member.InProgress,
        Closed: totalClosed,
        avgTurnAroundTime: (avgTAT / (1000 * 60 * 60)).toFixed(2) // Convert ms → hours
      };
    });

    res.status(200).json(stats);
  } catch (error) {
    console.error("❌ Error in getTicketStats:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
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

const downloadCsvFromS3 = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    // const fileKey = `IT-TICKETING/tickets-${month.toLowerCase()}-${year}.csv`;
    // const fileStream = await getS3FileStream(fileKey);
    const fileStream = await getClosedTicketsFile(month, year);

    res.setHeader('Content-Disposition', `attachment; filename=tickets-${month}-${year}.csv`);
    res.setHeader('Content-Type', 'text/csv');

    fileStream.pipe(res);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(404).json({ error: 'File not found or failed to download' });
  }
};

const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
const previewCsvFromS3 = async (req, res) => {
  try {
    const { month, year } = req.query;
    console.log(`🔍 Preview request for: ${month}, ${year}`);

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
module.exports = { register_user, getTicketStats, removeemployee, downloadCsvFromS3, previewCsvFromS3 };


