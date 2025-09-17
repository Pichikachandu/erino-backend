const { protect, getJwtSecret } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'User exists' });

  const user = await User.create({ email, password });
  sendToken(user, res, 201);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  sendToken(user, res, 200);
};

const logout = (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    expires: new Date(0)
  };
  
  res.cookie('jwt', '', cookieOptions);
  res.status(200).json({ 
    success: true, 
    message: 'Successfully logged out' 
  });
};

const getUser = (req, res) => {
  res.json({ id: req.user.id, email: req.user.email });
};

const sendToken = (user, res, statusCode) => {
  const secret = getJwtSecret();
  const token = jwt.sign(
    { id: user._id },
    secret,
    { expiresIn: '1d' }
  );
  
  // Set cookie with secure options for production
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    path: '/',
  };

  res.cookie('jwt', token, cookieOptions);
  
  const response = {
    success: true,
    id: user._id,
    email: user.email
  };

  // Only include token in development for testing
  if (process.env.NODE_ENV === 'development') {
    response.token = token;
  }

  res.status(statusCode).json(response);
};

module.exports = { register, login, logout, getUser };