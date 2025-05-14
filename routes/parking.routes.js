const express = require('express');
const router = express.Router();
const { registerEntry, registerExit } = require('../controllers/parking.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/entry', authMiddleware(['admin']), registerEntry);
router.post('/exit', authMiddleware(['admin']), registerExit);

module.exports = router;