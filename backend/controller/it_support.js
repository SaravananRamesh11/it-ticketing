const User=require("../models/User")
const Ticket = require('../models/Ticket');
const axios = require('axios');


const getAssignedTicketsBySupport = async (req, res) => {
  try {
    const { id } = req.body;

    const name = await User.getNameById(id);
    const tickets = await Ticket.find({
      itSupport: name,
      status: { $in: ['Open', 'InProgress'] } // ✅ Show both
    });

    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'sathukudi suthu adi' });
  }
};

const close_ticket=async(req,res)=>{
  try {
    const {id,resolution}=req.body
    const ticket=await Ticket.findById(id)
    ticket.status='Closed'
    ticket.resolution=resolution
    await ticket.save()
    res.status(200).json({
      message: 'Ticket closed successfully'
    })
  }
  catch(error)
  {
    res.status(500).json({message:"error closing the ticket"})
  }

}

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




module.exports = { getAssignedTicketsBySupport,close_ticket,updateTicketStatus };
