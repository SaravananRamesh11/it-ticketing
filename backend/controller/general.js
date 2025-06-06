const express=require("express")
const jwt=require("jsonwebtoken")
require("dotenv").config()
const User=require("../models/User")
const bcrypt = require('bcrypt');
const passwordValidator = require('password-validator');

// const login=async (req, res) => {
//   const { eid, password } = req.body;
//   try {
//     const user = await User.findOne({ employeeId: eid });
//     if (!user) return res.status(401).json({ message: 'Invalid EmployeeId' });

//     if(user.password===password)
//     {
//       const token = jwt.sign({ role: user.role, id: user._id }, "igiuug3erq", { expiresIn: '1h' });
//       const id =user._id;
//       const role=user.role;
//       res.status(200).json({token,id,role})

//     }
//     else{
//       res.status(401).json({ message: 'Invalid Password' });
//     }
  
//   }
//  catch(error)
//  {
//      res.status(500).json({ error: 'Server error' });
//  }

// }

// module.exports={login}

const login = async (req, res) => {
  const { eid, password } = req.body;
  console.log(eid)
  
  try {
    
    // Find user by employeeId
    const user = await User.findOne({ employeeId:eid });
    if (!user) {
      return res.status(401).json({ message: 'Invalid Employee ID or password' });
    }

    // Compare provided password with hashed password in database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid Employee ID or password from meeeee' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        role: user.role, 
        id: user._id,
        employeeId: user.employeeId // Include additional claims if needed
      }, 
      process.env.JWT_SECRET || "igiuug3erq", // Use environment variable for secret
      { expiresIn: '1h' }
    );

    // Return response without sensitive data
    res.status(200).json({
      token,
      id: user._id,
      role: user.role,
      employeeName: user.employeeName, // Include other non-sensitive user data
      email: user.email
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

const getdetails=async (req, res) => {
  try {
    const { id } = req.body; // Get _id from URL parameters
    console.log(id)

    //Validate ID exists
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Use the static method to get user details
    const user = await User.getDetails(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
    
  } catch (error) {
    console.error('Error fetching user:', error);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

// const password =async (req, res) => {
//   const { id, newPassword } = req.body;

//   if (!id || !newPassword) {
//     return res.status(400).json({ message: 'User ID and new password are required' });
//   }

//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       id,
//       { password: newPassword },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json({ message: 'Password updated successfully' });
//   } catch (error) {
//     console.error('Error updating password:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };




const password = async (req, res) => {
  const { id, newPassword } = req.body;

  // Basic validation
  if (!id || !newPassword) {
    return res.status(400).json({ message: 'User ID and new password are required' });
  }

  // Password strength validation (highly recommended)
  const schema = new passwordValidator();
  schema
    .is().min(8)
    .has().uppercase()
    .has().lowercase()
    .has().digits()
    .has().not().spaces();

  if (!schema.validate(newPassword)) {
    return res.status(400).json({ 
      message: 'Password must be at least 8 characters with uppercase, lowercase, and numbers'
    });
  }

  try {
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
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



module.exports = { login,getdetails,password};