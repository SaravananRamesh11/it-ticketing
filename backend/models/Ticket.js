const mongoose = require('mongoose'); 

const ticketSchema = new mongoose.Schema({
  employeeName: String,
  employeeId: String,
  issue: String,
  date: Date,
  time: String,
  email: String,
  itSupport: {
    type:String,
    default:null},
  resolution: {
    type:String,
    default:null},
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open'
  }
},{
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);