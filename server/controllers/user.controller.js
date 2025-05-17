const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, Log } = require('../models');
const logger = require('../utils/logger.util');
const { Op } = require('sequelize')

const login = [
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      await Log.create({ user_id: user.id, action: 'User logged in' });
      res.json({ token });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

const register = [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, role, password } = req.body;
    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
         name,
         email,
         role: role || 'user',
         password: hashedPassword });

      await Log.create({ user_id: user.id, action: 'User registered' });
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

const updateProfile = [
  body('name').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('password').optional().isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      const user = await User.findByPk(req.user.id);
      if (name) user.name = name;
      if (email) user.email = email;
      if (password) user.password = await bcrypt.hash(password, 10);
      await user.save();
      await Log.create({ user_id: user.id, action: 'Profile updated' });
      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

const listUsers = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  if (search.trim()) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  try {
    const { count, rows } = await User.findAndCountAll({
      where,
      offset,
      limit,
    });
    res.json({
      users: rows,
      totalItems: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      itemsPerPage: parseInt(limit),
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = { register, login, updateProfile, listUsers };