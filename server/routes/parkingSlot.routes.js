const express = require('express');
const router = express.Router();
const { bulkCreateSlots, updateSlot, deleteSlot, listSlots } = require('../controllers/parkingSlot.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/bulk', authMiddleware(['admin']), bulkCreateSlots);
router.put('/:id', authMiddleware(['admin']), updateSlot);
router.delete('/:id', authMiddleware(['admin']), deleteSlot);
router.get('/', authMiddleware(), listSlots);

module.exports = router;