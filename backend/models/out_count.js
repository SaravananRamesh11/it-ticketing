// // models/ITSupportStats.js
// const mongoose = require('mongoose');

// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const itSupportStatsSchema = new Schema({
//   user: {
//     type: Schema.Types.ObjectId,
//     ref: 'User', // Reference to the User model
//     required: true,
//     unique: true
//   },
//   itSupportName: {
//     type: String,
//     required: true
//   },
//   outOfTimeCount: {
//     type: Number,
//     default: 0
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('ITSupportStats', itSupportStatsSchema);


// itSupportStatsSchema.statics.resetAllCounts = async function () {
//   await this.updateMany({}, { $set: { outOfTimeCount: 0 } });
// };

// module.exports = mongoose.model('ITSupportStats', itSupportStatsSchema);

const mongoose = require('mongoose');
const { Schema } = mongoose;

const itSupportStatsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
    unique: true
  },
  itSupportName: {
    type: String,
    required: true
  },
  outOfTimeCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });


itSupportStatsSchema.statics.resetAllCounts = async function () {
  try {
    const result = await this.updateMany({}, { $set: { outOfTimeCount: 0 } });
    return result;
  } catch (error) {
    throw new Error('Failed to reset outOfTimeCount: ' + error.message);
  }
};



module.exports = mongoose.model('ITSupportStats', itSupportStatsSchema);
