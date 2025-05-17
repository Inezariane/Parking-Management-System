const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Vehicle, Log } = require('../models')
const logger = require('../utils/logger.util');

const addVehicle = [
  body('plate_number').notEmpty(),
  body('vehicle_type').isIn(['car', 'motorcycle', 'truck']),
  body('size').isIn(['small', 'medium', 'large']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { plate_number, vehicle_type, size, attributes = {} } = req.body;
    try {
      const vehicle = await Vehicle.create({
        plate_number,
        vehicle_type,
        size,
        attributes,
        user_id: req.user.id,
      });
      await Log.create({ user_id: req.user.id, action: 'Vehicle added' });
      res.status(201).json(vehicle);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

const updateVehicle = [
  body('plate_number').optional().notEmpty(),
  body('vehicle_type').optional().isIn(['car', 'motorcycle', 'truck']),
  body('size').optional().isIn(['small', 'medium', 'large']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { plate_number, vehicle_type, size, attributes } = req.body;
    try {
      const vehicle = await Vehicle.findByPk(req.params.id);
      if (!vehicle || vehicle.user_id !== req.user.id) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      if (plate_number) vehicle.plate_number = plate_number;
      if (vehicle_type) vehicle.vehicle_type = vehicle_type;
      if (size) vehicle.size = size;
      if (attributes) vehicle.attributes = attributes;
      await vehicle.save();
      await Log.create({ user_id: req.user.id, action: 'Vehicle updated' });
      res.json(vehicle);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle || vehicle.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    await vehicle.destroy();
    await Log.create({ user_id: req.user.id, action: 'Vehicle deleted' });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const listVehicles = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;

  const where = { user_id: req.user.id };

  if (search.trim()) {
    where[Op.or] = [
      { plate_number: { [Op.iLike]: `%${search}%` } },
      { vehicle_type: { [Op.iLike]: `%${search}%` } },
    ];
  }

  try {
    const { count, rows } = await Vehicle.findAndCountAll({
      where,
      offset,
      limit,
    });
    res.json({
      vehicles: rows,
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


module.exports = { addVehicle, updateVehicle, deleteVehicle, listVehicles };