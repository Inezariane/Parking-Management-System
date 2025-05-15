const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt.util');

const register = async (req, res) => {
  const { username, password, role, plate_number } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      role: role || 'user',
      plate_number: role === 'admin' ? null : plate_number,
    });
    res.status(201).json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        plate_number: user.plate_number 
      } 
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Username or plate number already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(user);
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        plate_number: user.plate_number 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

module.exports = { register, login };