const User = require('../models/User');
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
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: 'Logged out' });
};

const getUser = (req, res) => {
  res.json({ id: req.user.id, email: req.user.email });
};

const sendToken = (user, res, statusCode) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  res.status(statusCode).json({ id: user._id, email: user.email });
};

module.exports = { register, login, logout, getUser };