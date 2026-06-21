const express = require('express');
const logsController = require('../controllers/logsController');

const router = express.Router();

router.get('/', logsController.getLogs);
router.delete('/', logsController.clearLogs);

module.exports = router;
