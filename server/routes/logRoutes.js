const express = require('express');
const router = express.Router();
const { getAllLogActivity, getAllLogAkses } = require('../controllers/logController');
const AuthMiddleware = require('../middleware/authMiddleware');

router.get('/log-activity', AuthMiddleware, getAllLogActivity);
router.get('/log-akses', AuthMiddleware, getAllLogAkses);

module.exports = router;