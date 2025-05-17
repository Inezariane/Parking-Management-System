const express = require('express');
const router = express.Router();
const { createRequest, updateRequest, deleteRequest, approveRejectRequest, listRequests } = require('../controllers/slotRequest.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/', authMiddleware(), createRequest);
router.put('/:id', authMiddleware(), updateRequest);
router.delete('/:id', authMiddleware(), deleteRequest);
router.put('/:id/status', authMiddleware(['admin']), approveRejectRequest);
router.get('/', authMiddleware(), listRequests);

module.exports = router;