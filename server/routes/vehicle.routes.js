const express = require('express');
const router = express.Router();
const { addVehicle, updateVehicle, deleteVehicle, listVehicles } = require('../controllers/vehicle.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/', authMiddleware(), addVehicle);
router.put('/:id', authMiddleware(), updateVehicle);
router.delete('/:id', authMiddleware(), deleteVehicle);
router.get('/', authMiddleware(), listVehicles);

module.exports = router;