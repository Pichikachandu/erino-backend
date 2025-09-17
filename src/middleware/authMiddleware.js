const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const token = req.cookies.jwt;
  console.log('=== DEBUG protect middleware ===');
  console.log('JWT token from cookie:', token ? 'Present' : 'Missing');
  
  if (!token) {
    console.log('No token - returning 401');
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded); // Should show { id: 'user-id' }
    req.user = decoded;
    console.log('User attached to req:', req.user);
    console.log('=== END DEBUG ===');
    next();
  } catch (err) {
    console.log('JWT verification error:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { protect };