const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not defined in environment variables');
    throw new Error('Server configuration error');
  }
  return secret;
};

const protect = (req, res, next) => {
  // Try to get token from cookie first
  let token = req.cookies?.jwt;
  
  // If no token in cookie, try Authorization header
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  console.log('=== DEBUG protect middleware ===');
  console.log('JWT token from cookie:', req.cookies?.jwt ? 'Present' : 'Missing');
  console.log('JWT token from header:', req.headers.authorization ? 'Present' : 'Missing');
  
  if (!token) {
    console.log('No token found - returning 401');
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token provided' 
    });
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);
    
    if (!decoded?.id) {
      throw new Error('Invalid token payload');
    }
    
    console.log('Decoded JWT:', decoded);
    req.user = { id: decoded.id };
    console.log('User attached to req:', req.user);
    console.log('=== END DEBUG ===');
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    
    // Clear invalid token
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
    
    res.status(401).json({ 
      success: false,
      message: 'Not authorized, please log in again',
      error: err.message
    });
  }
};

module.exports = { protect, getJwtSecret };