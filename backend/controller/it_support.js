const User=require("../models/User")
const Ticket = require('../models/Ticket');
const axios = require('axios');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/aws'); // s3 is an S3Client instance
const crypto = require('crypto');
const sendEmail=require('../services/mailservice')
require('dotenv').config()



const close_ticket = async (req, res) => {
  try {
    const { id, resolution } = req.body;
    const file = req.file;
 
    // if (!file) {
    //   return res.status(400).json({ message: 'Proof image is required' });
    // }

    // Generate a unique hex name for the file
    //const hexName = crypto.randomBytes(16).toString('hex');
    //const extension = file.originalname.split('.').pop();
    //const s3Key = `IT-TICKETING/proofs/${hexName}.${extension}`;

    // Upload the file to S3
    // const uploadCommand = new PutObjectCommand({
    //   Bucket: process.env.BUCKET_NAME,
    //   Key: s3Key,
    //   Body: file.buffer,
    //   ContentType: file.mimetype
    // });

    // await s3.send(uploadCommand); // v3 uses .send()

    // Update the ticket in MongoDB
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = 'Closed';
    ticket.resolution = resolution;
    //ticket.proofImageKey = s3Key; // Store the S3 object key
    await ticket.save();

    res.status(200).json({ message: 'Ticket closed and image uploaded.' });
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({ message: 'Error closing the ticket' });
  }
};

const getAssignedTicketsBySupport = async (req, res) => {
  try {
    const { id } = req.body;
    const name = await User.getNameById(id);
    const tickets = await Ticket.find({
      itSupport: name,
      status: { $in: ['Open', 'InProgress'] }
    });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Error fetching tickets' });
  }
};



const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId, status } = req.body;

    // Your DB logic here
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({
      message: `Ticket status updated to ${status}`,
      ticket: updatedTicket,
    });
  } catch (err) {
    console.error('Error updating ticket status:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const time_exceeded =  async (req,res)=>{
  try{
    const {ticket}=req.body
    const text = `
    URGENT: Ticket Approaching Time Limit
    ====================================
    
    Ticket Details:
    - ID: ${ticket._id}
    - Employee: ${ticket.employeeName} (${ticket.employeeId})

    Issue Breakdown:
    - Category: ${ticket.issue.main}
    - Subcategory: ${ticket.issue.sub}
    - Specific Issue: ${ticket.issue.inner_sub}
    
    Time Status:
    - Created: ${new Date(ticket.createdAt).toLocaleString()}
    
    
    Action Required:
    Please review this ticket immediately and either:
    Contact the assigned technician
  `;
  const updatedTicket = await Ticket.setHrWarningTrue(ticket._id);

  sendEmail(process.env.HR,"ticket time limit exceeded",text);

  }

  catch(err)
  {
    console.log(err)
  }
    




}
module.exports = { getAssignedTicketsBySupport,close_ticket,updateTicketStatus,time_exceeded };
