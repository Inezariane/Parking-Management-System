const express = require('express');
const router = express.Router();
const { viewPayment, makePayment, viewAllPayments } = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/view', authMiddleware(['user']), viewPayment);
router.post('/pay', authMiddleware(['user']), makePayment);
router.get('/all', authMiddleware(['admin']), viewAllPayments);

module.exports = router;