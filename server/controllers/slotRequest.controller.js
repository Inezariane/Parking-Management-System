const { body, validationResult } = require('express-validator');
const { Op, Sequelize } = require('sequelize');

const { SlotRequest, Vehicle, ParkingSlot, Log, User } = require('../models'); 
const logger = require('../utils/logger.util');
const { sendSlotApprovalEmail } = require('../config/mailer.config');


const checkOwnershipAndPending = (request, userId) => {
  return request && request.user_id === userId && request.request_status === 'pending';
};

const createRequest = [
  body('vehicle_id').isUUID(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { vehicle_id } = req.body;
    try {
      const vehicle = await Vehicle.findByPk(vehicle_id);
      if (!vehicle || vehicle.user_id !== req.user.id) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      const request = await SlotRequest.create({
        user_id: req.user.id,
        vehicle_id,
      });
      await Log.create({ user_id: req.user.id, action: 'Slot request created' });
      res.status(201).json(request);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

const updateRequest = [
  body('vehicle_id').optional().isUUID(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { vehicle_id } = req.body;
    try {
      const request = await SlotRequest.findByPk(req.params.id);
      if (!checkOwnershipAndPending(request, req.user.id)) {
        return res.status(404).json({ error: 'Request not found or cannot be updated' });
      }
      if (vehicle_id) {
        const vehicle = await Vehicle.findByPk(vehicle_id);
        if (!vehicle || vehicle.user_id !== req.user.id) {
          return res.status(404).json({ error: 'Vehicle not found' });
        }
        request.vehicle_id = vehicle_id;
      }
      await request.save();
      await Log.create({ user_id: req.user.id, action: 'Slot request updated' });
      res.json(request);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

const deleteRequest = async (req, res) => {
  try {
    const request = await SlotRequest.findByPk(req.params.id);
    if (!checkOwnershipAndPending(request, req.user.id)) {
      return res.status(404).json({ error: 'Request not found or cannot be deleted' });
    }
    await request.destroy();
    await Log.create({ user_id: req.user.id, action: 'Slot request deleted' });
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const approveRejectRequest = [
  body('request_status').isIn(['approved', 'rejected']),
  body('slot_id').if(body('request_status').equals('approved')).isUUID(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { request_status, slot_id } = req.body;
    try {
      const request = await SlotRequest.findByPk(req.params.id, {
        include: [Vehicle, User],
      });

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      if (request.request_status !== 'pending') {
        return res.status(400).json({ error: 'Request already processed' }); 
      }

      if (request_status === 'approved') {
        const slot = await ParkingSlot.findByPk(slot_id);
        if (
          !slot ||
          slot.status !== 'available' ||
          slot.vehicle_type.toLowerCase() !== request.Vehicle.vehicle_type.toLowerCase() ||
          slot.size.toLowerCase() !== request.Vehicle.size.toLowerCase()
        ) {
          return res.status(400).json({ error: 'Invalid or unavailable slot' });
        }
        request.slot_id = slot_id;
        slot.status = 'unavailable';
        await slot.save();
        await sendSlotApprovalEmail(request.User, slot, request.Vehicle);
      }

      request.request_status = request_status;
      await request.save();
      await Log.create({ user_id: req.user.id, action: `Slot request ${request_status}` });
      res.json(request);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
];

const listRequests = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  if (search.trim()) {
    where.request_status = search;    
  }

  if (req.user.role !== 'admin') {
    where.user_id = req.user.id;
  }

  try {
    const { count, rows } = await SlotRequest.findAndCountAll({
      where,
      include: [Vehicle, ParkingSlot],
      offset,
      limit,
    });
    res.json({
      requests: rows,
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

module.exports = {
  createRequest,
  updateRequest,
  deleteRequest,
  approveRejectRequest,
  listRequests,
};