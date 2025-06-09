const jwt = require("jsonwebtoken");
require("dotenv").config()

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    //const decoded = jwt.verify(token,"mamaandsarva"); 
    const decoded = jwt.verify(token,process.env.JWT_SECRET); // Make sure JWT_SECRET is set in your .env
    req.user = decoded; // Attach user data to the request
    next(); // Proceed to the next middleware/route
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports={verifyToken}