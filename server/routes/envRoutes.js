const express = require('express');
const envController = require('../controllers/envController');

const router = express.Router();

router.get('/', envController.getEnvironmentVariables);

module.exports = router;
