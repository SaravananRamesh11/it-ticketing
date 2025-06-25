const express=require("express")
const Ticket=require("../models/Ticket")
const User=require("../models/User")
const sendEmail=require("../services/mailservice")
const mongoose=require("mongoose")

const password =async (req, res) => {
  const { id, newPassword } = req.body;

  if (!id || !newPassword) {
    return res.status(400).json({ message: 'User ID and new password are required' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: newPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// const ticket = async (req, res) => {
//   try {

//     console.log("Request body:", req.body);

//     const {
//       employeeName,
//       employeeId,
//       mainIssue,
//       subIssue,
//       innerSubIssue,
//       date,
//       time,
//       email,
//       id,
//       description
//     } = req.body; //  ✅ FIX: changed from req.body.ticketData to req.body

//     console.log(id);

//     // 1. Validate the requesting employee
//     const employee = await User.findOne({ _id: id });
//     console.log("employee :", employee);

//     if (!employee) {
//       return res.status(400).json({ message: 'Employee not found' });
//     }

//     // 2. Fetch all IT support members
//     const allSupport = await User.find({ role: 'IT Support' }).lean();
//     if (allSupport.length === 0) {
//       return res.status(500).json({ message: 'No IT support members found' });
//     }

//     // 3. Get open ticket counts by itSupport
//     const openTicketCounts = await Ticket.aggregate([
//       { $match: { status: 'Open' } },
//       { $group: { _id: '$itSupport', count: { $sum: 1 } } }
//     ]);

//     const ticketMap = {};
//     openTicketCounts.forEach(t => {
//       ticketMap[t._id] = t.count;
//     });

//     // 4. Choose IT support with least number of open tickets
//     let selectedSupport = allSupport[0];
//     let minCount = ticketMap[selectedSupport.employeeName] || 0;

//     allSupport.forEach(support => {
//       const count = ticketMap[support.employeeName] || 0;
//       if (count < minCount) {
//         minCount = count;
//         selectedSupport = support;
//       }
//     });

//     // ✅ Construct the nested issue structure
//     const issue = {
//       main: mainIssue,
//       sub: subIssue,
//       inner_sub: innerSubIssue
//     };

//     // 5. Create and save the ticket
//     const newTicket = new Ticket({
//       employeeName,
//       employeeId,
//       issue,
//       date: new Date(date),
//       time,
//       email,
//       itSupport: selectedSupport.employeeName,
//       description
//     });

//     await newTicket.save();

//     // 6. Send email notifications... (optional)

//     return res.status(201).json({
//       message: 'Ticket created successfully!',
//       ticketId: newTicket._id
//     });

//   } catch (error) {
//     console.error('Error creating ticket:', error);
//     return res.status(500).json({
//       message: 'Server error while creating ticket',
//       error: error.message
//     });
//   }
// };

const ticket = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const {
      employeeName,
      employeeId,
      email,
      id,
      date,
      time,
      description,
      issue   // ✅ directly use nested issue object
    } = req.body;

    // Validate employee
    const employee = await User.findOne({ _id: id });
    if (!employee) {
      return res.status(400).json({ message: 'Employee not found' });
    }

    // Get IT support staff
    const allSupport = await User.find({ role: 'IT Support' }).lean();
    if (allSupport.length === 0) {
      return res.status(500).json({ message: 'No IT support members found' });
    }

    const openTicketCounts = await Ticket.aggregate([
      { $match: { status: 'Open' } },
      { $group: { _id: '$itSupport', count: { $sum: 1 } } }
    ]);

    const ticketMap = {};
    openTicketCounts.forEach(t => {
      ticketMap[t._id] = t.count;
    });

    let selectedSupport = allSupport[0];
    let minCount = ticketMap[selectedSupport.employeeName] || 0;

    allSupport.forEach(support => {
      const count = ticketMap[support.employeeName] || 0;
      if (count < minCount) {
        minCount = count;
        selectedSupport = support;
      }
    });

    // ✅ create ticket directly with issue object
    const newTicket = new Ticket({
      employeeName,
      employeeId,
      email,
      date: new Date(date),
      time,
      issue,
      itSupport: selectedSupport.employeeName,
      description
    });

    await newTicket.save();

    return res.status(201).json({
      message: 'Ticket created successfully!',
      ticketId: newTicket._id
    });

  } catch (error) {
    console.error('Error creating ticket:', error);
    return res.status(500).json({
      message: 'Server error while creating ticket',
      error: error.message
    });
  }
};


const getUserTickets = async (req, res) => {
  try {
    const { userId } = req.body;

    // // 1. Validate the userId
    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //   return res.status(400).json({ 
    //     success: false,
    //     message: 'Invalid user ID format' 
    //   });
    // }

    // 2. Find the user to get their employeeId
    const user = await User.findById(userId).select('employeeId employeeName');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // 3. Find all tickets for this employee
    const tickets = await Ticket.find({ employeeId: user.employeeId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      employeeName: user.employeeName,
      tickets: tickets
    });

  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching tickets',
      error: error.message 
    });
  }
};

module.exports={ticket,password,getUserTickets }


// const ticket = async (req, res) => {
//   try {
    
//     const { employeeName, employeeId, issue, date, time, email, id ,description} = req.body.ticketData;
//     console.log(`${employeeName} ${employeeId} ${issue} ${date} ${time} ${email} ${id}`);

//     // 1. Validate the requesting employee
//     const employee = await User.findOne({  _id:id });
//     console.log('employee :',employee);
    
//     if (!employee) {
//       return res.status(400).json({ message: 'Employee not found' });
//     }

//     // 2. Fetch all IT support members
//     const allSupport = await User.find({ role: 'IT Support' }).lean();
//     if (allSupport.length === 0) {
//       return res.status(500).json({ message: 'No IT support members found' });
//     }

//     // 3. Get open ticket counts by itSupport
//     const openTicketCounts = await Ticket.aggregate([
//       { $match: { status: 'Open' } },
//       { $group: { _id: '$itSupport', count: { $sum: 1 } } }
//     ]);

//     const ticketMap = {};
//     openTicketCounts.forEach(t => {
//       ticketMap[t._id] = t.count;
//     });

//     // 4. Choose IT support with least number of open tickets
//     let selectedSupport = allSupport[0];
//     let minCount = ticketMap[selectedSupport.employeeName] || 0;

//     allSupport.forEach(support => {
//       const count = ticketMap[support.employeeName] || 0;
//       if (count < minCount) {
//         minCount = count;
//         selectedSupport = support;
//       }
//     });

//     // 5. Create and save the ticket
//     const newTicket = new Ticket({
//       employeeName,
//       employeeId,
//       issue,
//       date: new Date(date),
//       time,
//       email,
//       itSupport: selectedSupport.employeeName,
//       description
//     });

//     await newTicket.save();

//     // 6. Send email notifications
//     try {
//       // Email to employee
//       const employeeSubject = `Ticket Created: ${issue}`;
//       const employeeText = `Dear ${employeeName},\n\n` +
//         `Your ticket has been successfully created and assigned to ${selectedSupport.employeeName}.\n\n` +
//         `Ticket Details:\n` +
//         `- Issue: ${issue}\n` +
//         `- Date: ${new Date(date).toLocaleDateString()}\n` +
//         `- Time: ${time}\n` +
//         `- Ticket ID: ${newTicket._id}\n\n` +
//         `We'll notify you once your ticket is resolved.`;

//       // Email to IT support
//       const supportSubject = `New Ticket Assigned: ${issue}`;
//       const supportText = `Hello ${selectedSupport.employeeName},\n\n` +
//         `A new ticket has been assigned to you:\n\n` +
//         `- Employee: ${employeeName} (ID: ${employeeId})\n` +
//         `- Email: ${email}\n` +
//         `- Issue: ${issue}\n` +
//         `- Date: ${new Date(date).toLocaleDateString()}\n` +
//         `- Time: ${time}\n` +
//         `- Ticket ID: ${newTicket._id}\n\n` +
//         `Please address this ticket at your earliest convenience.`;

//       // Send both emails in parallel
//       await Promise.all([
//         sendEmail(email, employeeSubject, employeeText),
//         sendEmail(selectedSupport.email, supportSubject, supportText)
//       ]);

//       console.log('Notification emails sent successfully');
//     } catch (emailError) {
//       console.error('Failed to send notification emails:', emailError);
//       // Don't fail the ticket creation if emails fail
//     }

//     return res.status(201).json({ 
//       message: 'Ticket created successfully!',
//       ticketId: newTicket._id
//     });

//   } catch (error) {
//     console.error('Error creating ticket:', error);
//     return res.status(500).json({ 
//       message: 'Server error while creating ticket',
//       error: error.message 
//     });
//   }
// };

// const ticket = async (req, res) => {
//   try {
//     const {
//       employeeName,
//       employeeId,
//       mainIssue,
//       subIssue,
//       innerSubIssue,
//       date,
//       time,
//       email,
//       id,
//       description
//     } = req.body.ticketData;

//     console.log(id);

//     // 1. Validate the requesting employee
//     const employee = await User.findOne({ _id: id });
//     console.log("employee :", employee);

//     if (!employee) {
//       return res.status(400).json({ message: 'Employee not found' });
//     }

//     // 2. Fetch all IT support members
//     const allSupport = await User.find({ role: 'IT Support' }).lean();
//     if (allSupport.length === 0) {
//       return res.status(500).json({ message: 'No IT support members found' });
//     }

//     // 3. Get open ticket counts by itSupport
//     const openTicketCounts = await Ticket.aggregate([
//       { $match: { status: 'Open' } },
//       { $group: { _id: '$itSupport', count: { $sum: 1 } } }
//     ]);

//     const ticketMap = {};
//     openTicketCounts.forEach(t => {
//       ticketMap[t._id] = t.count;
//     });

//     // 4. Choose IT support with least number of open tickets
//     let selectedSupport = allSupport[0];
//     let minCount = ticketMap[selectedSupport.employeeName] || 0;

//     allSupport.forEach(support => {
//       const count = ticketMap[support.employeeName] || 0;
//       if (count < minCount) {
//         minCount = count;
//         selectedSupport = support;
//       }
//     });

//     // ✅ Construct the correct nested issue structure
//     const issue = {
//       main: mainIssue,
//       sub: subIssue,
//       inner_sub: innerSubIssue
//     };

//     // 5. Create and save the ticket
//     const newTicket = new Ticket({
//       employeeName,
//       employeeId,
//       issue,
//       date: new Date(date),
//       time,
//       email,
//       itSupport: selectedSupport.employeeName,
//       description
//     });

//     await newTicket.save();

//     // 6. Send email notifications...
//     // (keep as-is)

//     return res.status(201).json({
//       message: 'Ticket created successfully!',
//       ticketId: newTicket._id
//     });

//   } catch (error) {
//     console.error('Error creating ticket:', error);
//     return res.status(500).json({
//       message: 'Server error while creating ticket',
//       error: error.message
//     });
//   }
// };
