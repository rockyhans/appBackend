const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret'; // Use your actual secret

const fetchUser = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract token from Authorization header
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified.user; // Add user information to the request
    next(); // Move to the next middleware/route handler
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};
module.exports = fetchUser;
