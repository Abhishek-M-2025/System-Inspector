const express = require('express');
const systemController = require('../controllers/systemController');

const router = express.Router();

router.get('/', systemController.getSystemInfo);

module.exports = router;
