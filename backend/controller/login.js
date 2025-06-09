const express=require("express")
const jwt=require("jsonwebtoken")
require("dotenv").config()
const User=require("../models/User")
const bcrypt = require('bcrypt');
const passwordValidator = require('password-validator');
const nodemailer=require("nodemailer")

const login = async (req, res) => {
  const { eid, password } = req.body;
  console.log(eid)
  
  try {
    
    // Find user by employeeId
    const user = await User.findOne({ employeeId:eid });
    if (!user) {
      return res.status(401).json({ message: 'Invalid Employee ID or password' });
    }

    // Compare provided password with hashed password in database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid Employee ID or password from meeeee' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        role: user.role, 
        id: user._id,
        employeeId: user.employeeId // Include additional claims if needed
      }, 
      process.env.JWT_SECRET || "igiuug3erq", // Use environment variable for secret
      { expiresIn: '1h' }
    );

    // Return response without sensitive data
    res.status(200).json({
      token,
      id: user._id,
      role: user.role,
      employeeName: user.employeeName, // Include other non-sensitive user data
      email: user.email
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};


const sendOTP  =async (req, res) => {
  const { email } = req.body;

  try {
    
    const user = await User.findOne({ email });
    if (email ==="")
    {
         return res.status(404).json({ message: 'email field is empty' });
    }
    if (!user) return res.status(404).json({ message: 'Not a registered email' });
    

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    user.otp = hashedOtp;
    user.otpExpiry = expiry;
    await user.save();

    // Send Email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`
    });

    return res.json({ message: 'OTP sent to email' });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Server error', error });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: 'OTP not requested' });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });

    return res.json({ message: 'OTP verified' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: 'OTP not requested' });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Clear OTP
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};
module.exports={login,verifyOTP,sendOTP,resetPassword}