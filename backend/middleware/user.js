const checkUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: No user data found." });
  }

  if (req.user.role !== "Employee") {
    return res.status(403).json({ message: "Forbidden: Admins only." });
  }

  next(); // Role is admin, proceed
};

module.exports={checkUser}