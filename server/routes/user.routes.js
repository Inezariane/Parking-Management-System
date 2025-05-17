const express = require('express');
const router = express.Router();
const { register, login, updateProfile, listUsers } = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.put('/profile', authMiddleware(), updateProfile);
router.get('/', authMiddleware(['admin']), listUsers);
module.exports = router;