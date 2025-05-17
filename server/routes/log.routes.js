const express = require('express');
const router = express.Router();
const { listLogs } = require('../controllers/log.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware(['admin']), listLogs);

module.exports = router;