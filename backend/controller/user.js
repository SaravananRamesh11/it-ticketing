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

const ticket = async (req, res) => {
  try {
    const { employeeName, employeeId, issue, date, time, email, id, description } = req.body;

    // 1. Validate the requesting employee
    const employee = await User.findOne({ _id: id });
    if (!employee) {
      return res.status(400).json({ message: 'Employee not found' });
    }

    // 2. Get all IT support staff
    const allSupport = await User.find({ role: 'IT Support' }).lean();
    if (allSupport.length === 0) {
      return res.status(500).json({ message: 'No IT support members found' });
    }

    // 3. Get open ticket counts
    const openTicketCounts = await Ticket.aggregate([
      { $match: { status: 'Open' } },
      { $group: { _id: '$itSupport', count: { $sum: 1 } } }
    ]);

    const ticketMap = {};
    openTicketCounts.forEach(t => {
      ticketMap[t._id] = t.count;
    });

    // 4. Choose IT support with fewest open tickets
    let selectedSupport = allSupport[0];
    let minCount = ticketMap[selectedSupport.employeeId] || 0;

    allSupport.forEach(support => {
      const count = ticketMap[support.employeeId] || 0;
      if (count < minCount) {
        minCount = count;
        selectedSupport = support;
      }
    });

    // 5. Create the ticket
    const newTicket = new Ticket({
      employeeName,
      employeeId,
      email,
      date: new Date(date),
      time,
      itSupport: selectedSupport.employeeId,
      issue,
      description
    });

    await newTicket.save();

    // 6. Send email notifications
    const itSupportEmail = await User.getEmailByEmployeeId(selectedSupport.employeeId);

    const subject = `New IT Support Ticket Assigned - ${issue.main}`;
    const employeeMessage = `
Hello ${employeeName},

Your IT support ticket has been created successfully.

Ticket Details:
• Issue: ${issue.main} > ${issue.sub} > ${issue.inner_sub}
• Description: ${description}
• Assigned IT Support: ${selectedSupport.employeeName}

Ticket ID: ${newTicket._id}

Thank you.
`;

    const supportMessage = `
Hello ${selectedSupport.employeeName},

A new IT support ticket has been assigned to you.

Ticket Details:
• From: ${employeeName} (${employeeId})
• Issue: ${issue.main} > ${issue.sub} > ${issue.inner_sub}
• Description: ${description}

Please log in to the system to view more details.

Ticket ID: ${newTicket._id}
`;

    if (email) {
      await sendEmail(email, subject, employeeMessage);
    }

    if (itSupportEmail) {
      await sendEmail(itSupportEmail, subject, supportMessage);
    }

    return res.status(201).json({
      message: 'Ticket created and email notifications sent successfully!',
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



