// // backend/routes/ticketRoutes.js
// const express = require('express');
// const router = express.Router();
// const Ticket = require('../models/Ticket');

// // GET all tickets
// router.get('/', async (req, res) => {
//   const tickets = await Ticket.find();
//   res.json(tickets);
// });

// // POST a new ticket
// router.post('/', async (req, res) => {
//   const newTicket = new Ticket(req.body);
//   await newTicket.save();
//   res.status(201).json(newTicket);
// });

// // UPDATE ticket by ID
// router.put('/:id', async (req, res) => {
//   const updatedTicket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
//   res.json(updatedTicket);
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const {ticket,password} = require('../controller/user');
const {verifyToken}=require('../middleware/general')
const{checkUser}=require("../middleware/user")

router.use(verifyToken,checkUser);



// Submit a ticket
router.post('/ticket', ticket);

router.put('/password',password);

module.exports = router;