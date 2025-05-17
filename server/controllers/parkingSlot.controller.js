const { body, validationResult } = require('express-validator');
const { Op, Sequelize } = require('sequelize');
const { ParkingSlot, Log } = require('../models');
const logger = require('../utils/logger.util');

const bulkCreateSlots = [
  body('slots').isArray().notEmpty(),
  body('slots.*.slot_number').notEmpty(),
  body('slots.*.size').isIn(['small', 'medium', 'large']),
  body('slots.*.vehicle_type').isIn(['car', 'motorcycle', 'truck']),
  body('slots.*.location').isIn(['north', 'west', 'east', 'south']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { slots } = req.body;
    try {
      const createdSlots = await ParkingSlot.bulkCreate(slots);
      await Log.create({ user_id: req.user.id, action: 'Bulk slots created' });
      res.status(201).json(createdSlots);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

const updateSlot = [
  body('slot_number').optional().notEmpty(),
  body('size').optional().isIn(['small', 'medium', 'large']),
  body('vehicle_type').optional().isIn(['car', 'motorcycle', 'truck']),
  body('location').optional().isIn(['north', 'west', 'east', 'south']),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { slot_number, size, vehicle_type, location } = req.body;
    try {
      const slot = await ParkingSlot.findByPk(req.params.id);
      if (!slot) {
        return res.status(404).json({ error: 'Slot not found' });
      }
      if (slot_number) slot.slot_number = slot_number;
      if (size) slot.size = size;
      if (vehicle_type) slot.vehicle_type = vehicle_type;
      if (location) slot.location = location;
      await slot.save();
      await Log.create({ user_id: req.user.id, action: 'Slot updated' });
      res.json(slot);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

const deleteSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findByPk(req.params.id);
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    await slot.destroy();
    await Log.create({ user_id: req.user.id, action: 'Slot deleted' });
    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const listSlots = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  if (search.trim()) {
    where[Op.or] = [
      Sequelize.where(Sequelize.cast(Sequelize.col('slot_number'), 'TEXT'), {
        [Op.iLike]: `%${search}%`,
      }),
      Sequelize.where(Sequelize.cast(Sequelize.col('vehicle_type'), 'TEXT'), {
        [Op.iLike]: `%${search}%`,
      }),
      Sequelize.where(Sequelize.cast(Sequelize.col('size'), 'TEXT'), {
        [Op.iLike]: `%${search}%`,
      }),
    ];
  }

  if (req.user.role !== 'admin') {
    where.status = 'available';
  }

  try {
    const { count, rows } = await ParkingSlot.findAndCountAll({
      where,
      offset,
      limit,
    });

    res.json({
      slots: rows,
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



module.exports = { bulkCreateSlots, updateSlot, deleteSlot, listSlots };