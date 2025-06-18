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
    console.log("sarva called ",req.body);
    const { employeeName, employeeId, issue, date, time, email, id } = req.body.ticketData;
    console.log(`${employeeName} ${employeeId} ${issue} ${date} ${time} ${email} ${id}`);

    // 1. Validate the requesting employee
    const employee = await User.findOne({  _id:id });
    if (!employee) {
      return res.status(400).json({ message: 'Employee not found' });
    }

    // 2. Fetch all IT support members
    const allSupport = await User.find({ role: 'IT Support' }).lean();
    if (allSupport.length === 0) {
      return res.status(500).json({ message: 'No IT support members found' });
    }

    // 3. Get open ticket counts by itSupport
    const openTicketCounts = await Ticket.aggregate([
      { $match: { status: 'Open' } },
      { $group: { _id: '$itSupport', count: { $sum: 1 } } }
    ]);

    const ticketMap = {};
    openTicketCounts.forEach(t => {
      ticketMap[t._id] = t.count;
    });

    // 4. Choose IT support with least number of open tickets
    let selectedSupport = allSupport[0];
    let minCount = ticketMap[selectedSupport.employeeName] || 0;

    allSupport.forEach(support => {
      const count = ticketMap[support.employeeName] || 0;
      if (count < minCount) {
        minCount = count;
        selectedSupport = support;
      }
    });

    // 5. Create and save the ticket
    const newTicket = new Ticket({
      employeeName,
      employeeId,
      issue,
      date: new Date(date),
      time,
      email,
      itSupport: selectedSupport.employeeName
    });

    await newTicket.save();

    // 6. Send email notifications
    try {
      // Email to employee
      const employeeSubject = `Ticket Created: ${issue}`;
      const employeeText = `Dear ${employeeName},\n\n` +
        `Your ticket has been successfully created and assigned to ${selectedSupport.employeeName}.\n\n` +
        `Ticket Details:\n` +
        `- Issue: ${issue}\n` +
        `- Date: ${new Date(date).toLocaleDateString()}\n` +
        `- Time: ${time}\n` +
        `- Ticket ID: ${newTicket._id}\n\n` +
        `We'll notify you once your ticket is resolved.`;

      // Email to IT support
      const supportSubject = `New Ticket Assigned: ${issue}`;
      const supportText = `Hello ${selectedSupport.employeeName},\n\n` +
        `A new ticket has been assigned to you:\n\n` +
        `- Employee: ${employeeName} (ID: ${employeeId})\n` +
        `- Email: ${email}\n` +
        `- Issue: ${issue}\n` +
        `- Date: ${new Date(date).toLocaleDateString()}\n` +
        `- Time: ${time}\n` +
        `- Ticket ID: ${newTicket._id}\n\n` +
        `Please address this ticket at your earliest convenience.`;

      // Send both emails in parallel
      await Promise.all([
        sendEmail(email, employeeSubject, employeeText),
        sendEmail(selectedSupport.email, supportSubject, supportText)
      ]);

      console.log('Notification emails sent successfully');
    } catch (emailError) {
      console.error('Failed to send notification emails:', emailError);
      // Don't fail the ticket creation if emails fail
    }

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



module.exports={ticket,password}