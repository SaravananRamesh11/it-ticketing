const User=require("../models/User")
const Ticket = require('../models/Ticket');

const getOpenTicketsBySupport = async (req, res) => {

  try {
    const {id}=req.body
    
    const name = await User.getNameById(id);
    const tickets = await Ticket.find({
      itSupport: name,
      status: 'Open'
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

module.exports = { getOpenTicketsBySupport,close_ticket };
