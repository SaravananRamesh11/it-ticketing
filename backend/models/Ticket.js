// const mongoose = require('mongoose'); 

// const ticketSchema = new mongoose.Schema({
//   employeeName: String,
//   employeeId: String,
//   issue: {
//     main: {
//       type: String,
//       required: true
//     },
//     sub: {
//       type: String,
//       required: true
//     },
//     inner_sub: {
//       type: String,
//       required: false // Optional field
//     }
//   },
//   date: Date,
//   time: String,
//   email: String,
//   itSupport: {
//     type: String,
//     default: null
//   },
//   resolution: {
//     type: String,
//     default: null
//   },
//   proofImageKey: {
//     type: String,
//     default: null // This will store the hex name or S3 object key
//   },
//   status: {
//     type: String,
//     enum: ['Open', 'Closed', 'InProgress'],
//     default: 'Open'
//   },
//   hr_warning:{
//     type:Boolean,
//     default:false
//   }
// }, {
//   timestamps: true
// });




const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  employeeName: String,
  employeeId: String,
  issue: {
    main: {
      type: String,
      required: true
    },
    sub: {
      type: String,
      required: true
    },
    inner_sub: {
      type: String,
      required: false
    }
  },
  date: Date,
  time: String,
  email: String,
  itSupport: {
    type: String,
    default: null
  },
  resolution: {
    type: String,
    default: null
  },
  proofImageKey: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['Open', 'Closed', 'InProgress'],
    default: 'Open'
  },
  hr_warning: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Static method to set hr_warning to true
ticketSchema.statics.setHrWarningTrue = async function (_id) {
  const updated = await this.findByIdAndUpdate(
    _id,
    { hr_warning: true },
    { new: true } // return updated document
  ).lean();
  
  return updated || null;
};


ticketSchema.statics.getTicketById = async function (_id) {
  const ticket = await this.findById(_id).lean();
  return ticket || null;
};


ticketSchema.statics.getInProgressTickets = async function () {
  return await this.find({ status: 'InProgress' }).lean();
};
module.exports = mongoose.model('Ticket', ticketSchema);
