const User=require("../models/User")
const Ticket = require('../models/Ticket');
const axios = require('axios');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/aws'); // s3 is an S3Client instance
const crypto = require('crypto');
const sendEmail=require('../services/mailservice')
require('dotenv').config()
const multer = require('multer');
const upload = multer();
const ITSupportStats=require("../models/out_count")

const close_ticket = async (req, res) => {
  try {
    const { id, resolution } = req.body; // Changed from 'remark' to 'resolution' to match schema
    console.log(resolution)
    console.log(id)
    // Validate required fields
    if ( !resolution) {
      return res.status(400).json({ 
        success: false, 
        message: ' resolution is required' 
      });
    }

    let proofImageKey = null;
    let proofImageUrl = null;

    // Handle image upload if present
    if (req.file) {
      try {
        // Generate secure filename
        const hexName = crypto.randomBytes(16).toString('hex');
        const fileExtension = req.file.originalname.split('.').pop();
        proofImageKey = `IT-TICKETING/proofs/${hexName}.${fileExtension}`;
        console.log(`from try block proofImageKey: ${proofImageKey}`)

        const uploadCommand = new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: proofImageKey,
          Body: req.file.buffer,
          ContentType: req.file.mimetype
        });

        await s3.send(uploadCommand);
        
        // Generate direct S3 object URL for CSV export
        // Format: https://bucket-name.s3.region.amazonaws.com/key
        const region = process.env.AWS_REGION || '';
        const bucketName = process.env.BUCKET_NAME;
        proofImageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${proofImageKey}`;
        console.log(`Generated proofImageUrl: ${proofImageUrl}`);
      } catch (uploadError) {
        console.error('Image upload failed, still closing ticket:', uploadError);
        // Continue without failing the entire operation
      }
    }
    
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = 'Closed';
    ticket.resolution = resolution;
    ticket.proofImageKey = proofImageKey; // Store the S3 object key
    ticket.proofImageUrl = proofImageUrl; // Store the signed URL
    console.log(` before saving ${ticket}`)
    await ticket.save();
    console.log(` after saving ${ticket}`)

    res.status(200).json({ message: 'Ticket closed and image uploaded.' });
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({ message: 'Error closing the ticket' });
  }
};

const getAssignedTicketsBySupport = async (req, res) => {
  try {
    const { id } = req.body;

    console.log("id in getassignedticket",id)
    const empid = await User.getEmployeeIdById(id);
    const tickets = await Ticket.find({
      itSupport: empid,
      status: { $in: ['Open', 'InProgress'] }
    });
    console.log("from get assigned tickets for itsupport", tickets);
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

const time_exceeded = async (req, res) => {
  try {
    const { ticket } = req.body;

    if (!ticket || !ticket._id) {
      console.error("❌ Missing ticket data in request body:", req.body);
      return res.status(400).json({ message: "Invalid ticket data" });
    }

    console.log("➡️ Ticket received for expiry processing:", ticket._id);

    // Step 1: Update ticket
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticket._id,
      { hr_warning: true },
      { new: true }
    );

    if (!updatedTicket) {
      console.error("❌ Ticket not found in DB:", ticket._id);
      return res.status(404).json({ message: "Ticket not found" });
    }

    console.log("✅ Ticket marked with HR warning");

    // Step 2: Find IT support user
    const itSupportUser = await User.findOne({ employeeId: ticket.itSupport });
    if (!itSupportUser) {
      console.warn("⚠️ IT Support user not found:", ticket.itSupport);
    }

    // Step 3: Stats update
    if (itSupportUser) {
      const existingStats = await ITSupportStats.findOne({ user: itSupportUser._id });

      if (existingStats) {
        existingStats.outOfTimeCount += 1;
        await existingStats.save();
      } else {
        await ITSupportStats.create({
          user: itSupportUser._id,
          itSupportName: itSupportUser.employeeName,
          outOfTimeCount: 1
        });
      }

      console.log("✅ Stats updated");
    }

    // Step 4: Send HR email
    console.log("📧 Preparing to send HR email to:", process.env.HR);

    const text = `
⚠️ URGENT: Ticket Time Limit Exceeded
====================================

Ticket Details:
- ID: ${ticket._id}
- Employee: ${ticket.employeeName} (${ticket.employeeId})

Issue:
- Category: ${ticket.issue.main}
- Subcategory: ${ticket.issue.sub}
- Specific Issue: ${ticket.issue.inner_sub}

Time Status:
- Created: ${new Date(ticket.createdAt).toLocaleString()}

Action Required:
This ticket has exceeded its SLA time. Please review and take appropriate action.
`;

    await sendEmail(process.env.HR, "🚨 Ticket Time Limit Exceeded", text);

    console.log("✅ HR email sent successfully");

    res.status(200).json({ message: "Ticket marked as out-of-time and HR notified." });
  } catch (err) {
    console.error("❌ Error in time_exceeded controller:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

const makezero = async (req, res) => {
  try {
    await ITSupportStats.resetAllCounts();
    res.status(200).json({
      success: true,
      message: "All outOfTimeCount values have been reset to 0."
    });
  } catch (error) {
    console.error("Failed to reset counts:", error);
    res.status(500).json({
      success: false,
      message: "Server error while resetting counts.",
      error: error.message
    });
  }
};

const returnName=async(req,res)=>{
  try{
    const {name}=req.body
    const itSupportUser=await User.findOne({employeeId:name})
    if(itSupportUser){
      res.status(200).json({success:true,itSupportName:itSupportUser.employeeName})

  }
}
  catch(err)
  {
    res.status(404).json({"message":"sorry couldnt get itsupport's name"})
  }
}

module.exports = { getAssignedTicketsBySupport,close_ticket,updateTicketStatus,time_exceeded,makezero,returnName};






// photo mandatory code

// const close_ticket = async (req, res) => {
//   try {
//     const { id, resolution } = req.body;
//     const file = req.file;
 
//     if (!file) {
//       return res.status(400).json({ message: 'Proof image is required' });
//     }

//     //Generate a unique hex name for the file
//     const hexName = crypto.randomBytes(16).toString('hex');
//     const extension = file.originalname.split('.').pop();
//     const s3Key = `IT-TICKETING/proofs/${hexName}.${extension}`;

//     //Upload the file to S3
//     const uploadCommand = new PutObjectCommand({
//       Bucket: process.env.BUCKET_NAME,
//       Key: s3Key,
//       Body: file.buffer,
//       ContentType: file.mimetype
//     });

//     await s3.send(uploadCommand); // v3 uses .send()

//     //Update the ticket in MongoDB
//     const ticket = await Ticket.findById(id);
//     if (!ticket) {
//       return res.status(404).json({ message: 'Ticket not found' });
//     }

//     ticket.status = 'Closed';
//     ticket.resolution = resolution;
//     //ticket.proofImageKey = s3Key; // Store the S3 object key
//     await ticket.save();

//     res.status(200).json({ message: 'Ticket closed and image uploaded.' });
//   } catch (error) {
//     console.error('Error closing ticket:', error);
//     res.status(500).json({ message: 'Error closing the ticket' });
//   }
// };


// const time_exceeded = async (req, res) => {
//   try {
//     const { ticket } = req.body;

//     // Step 1: Set HR warning flag on the ticket
//     const updatedTicket = await Ticket.findByIdAndUpdate(
//       ticket._id,
//       { hr_warning: true },
//       { new: true }
//     );

//     // Step 2: Get the IT support user object by employeeId
//     const itSupportUser = await User.findOne({ employeeId: ticket.itSupport });

//     if (itSupportUser) {
//       // Step 3: Check if stats entry exists
//       const existingStats = await ITSupportStats.findOne({ user: itSupportUser._id });

//       if (existingStats) {
//         existingStats.outOfTimeCount += 1;
//         await existingStats.save();
//       } else {
//         await ITSupportStats.create({
//           user: itSupportUser._id,
//           itSupportName: itSupportUser.employeeName,
//           outOfTimeCount: 1
//         });
//       }
//     }

//     // Step 4: Send HR email
//     const text = `
//     ⚠️ URGENT: Ticket Time Limit Exceeded
//     ====================================

//     Ticket Details:
//     - ID: ${ticket._id}
//     - Employee: ${ticket.employeeName} (${ticket.employeeId})

//     Issue:
//     - Category: ${ticket.issue.main}
//     - Subcategory: ${ticket.issue.sub}
//     - Specific Issue: ${ticket.issue.inner_sub}

//     Time Status:
//     - Created: ${new Date(ticket.createdAt).toLocaleString()}

//     Action Required:
//     This ticket has exceeded its SLA time. Please review and take appropriate action.
//     `;

//     // await sendEmail(process.env.HR, "🚨 Ticket Time Limit Exceeded", text);
//     await sendEmail('mahadevmanohar07@gmail.com', 'Test Email', 'This is a test');

//     res.status(200).json({ message: "Ticket marked as out-of-time and HR notified." });

//   } catch (err) {
//     console.error("❌ Error in time_exceeded controller:", err);
//     res.status(500).json({ message: "Internal server error", error: err.message });
//   }
// };
