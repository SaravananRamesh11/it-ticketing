const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Number of salt rounds for bcrypt
const Ticket=require("../models/Ticket")
const { getClosedTicketsFile } = require('../utils/s3Downloader');

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
      message: 'Employee added successfully',
      employee: employeeData
    });

  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// In your backend controller
const getTicketStats = async (req, res) => {
  try {
    // Get all IT support members
    const itSupportMembers = await User.find({ role: 'IT Support' }).lean();
    
    // Get ticket counts for each support member
    const stats = await Promise.all(itSupportMembers.map(async (member) => {
      const closedCount = await Ticket.countDocuments({
        itSupport: member.employeeName,
        status: 'Closed'
      });
      
      const totalCount = await Ticket.countDocuments({
        itSupport: member.employeeName
      });
      
      return {
        name: member.employeeName,
        closed: closedCount,
        open: totalCount - closedCount
      };
    }));
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    res.status(500).json({ error: 'Failed to fetch ticket statistics' });
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


module.exports = { register_user, getTicketStats, removeemployee, downloadCsvFromS3 };