const express = require('express');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.get('/dashboard', reportController.getDashboard);
router.get('/:type', reportController.generateReport);

module.exports = router;
