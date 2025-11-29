const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  employeeName: String,
  employeeId: String,
  email: String,
  role: String,
  password: String,
  otp: String,
  otpExpiry: Date
});

userSchema.statics.getNameById = async function (_id) {
  const user = await this.findById(_id).lean();
  return user?.employeeName || null;
};

userSchema.statics.getDetails = async function (_id) {
  const user = await this.findById(_id).select('-password').lean(); // Exclude password
  return user || null; // Return user or null if not found
};

userSchema.statics.getEmployeeIdById = async function (_id) {
  const user = await this.findById(_id).select('employeeId').lean();
  return user?.employeeId || null;
};

userSchema.statics.getEmailByEmployeeId = async function (employeeId) {
  const user = await this.findOne({ employeeId }).select('email').lean();
  return user?.email || null;
};

module.exports = mongoose.model('User', userSchema);










// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   employeeName: String,
//   employeeId: String,
//   email:String,
//   role: String,
//   password:String,
//   otp: String,
//   otpExpiry: Date
// });

// userSchema.statics.getNameById = async function (_id) {
//   const user = await this.findById(_id).lean();
//   return user?.employeeName || null;
// };

// userSchema.statics.getDetails = async function (_id) {
//   const user = await this.findById(_id).select('-password').lean(); // Exclude password
//   return user || null; // Return user or null if not found
// };

// userSchema.statics.getEmployeeIdById = async function (_id) {
//   const user = await this.findById(_id).select('employeeId').lean();
//   return user?.employeeId || null;
// };

// module.exports = mongoose.model('User', userSchema);
