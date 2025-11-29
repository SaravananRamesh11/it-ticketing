const User=require("../../models/User")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function checkUser(eid) {

    console.log("hi from the function")
  const user = await User.findOne({ employeeId: eid });
  if (!user) {
    throw new Error('Invalid Employee ID or password'); // throws an error
  }
  return user; // returns user if found
}

async function validatePassword(plainPassword, hashedPassword) {
  if (!hashedPassword) {
    throw new Error('Password not set for user');
  }
  const isValid = await bcrypt.compare(plainPassword, hashedPassword);
  if (!isValid) {
    throw new Error('Invalid Employee ID or password');
  }
  return true; // password is valid
}

function generateToken(user) {
  if (!user) throw new Error('User data is required');

  const token = jwt.sign(
    {
      role: user.role,
      id: user._id,
      employeeId: user.employeeId
    },
    process.env.JWT_SECRET || 'igiuug3erq',
    { expiresIn: '1h' }
  );

  return token;
}

module.exports = { checkUser,validatePassword,generateToken};
