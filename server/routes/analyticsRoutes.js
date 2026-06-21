const express = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

router.get('/', analyticsController.getOverview);
router.get('/project', analyticsController.getProjectAnalytics);

router.get(/^\/file\/(.+)/, (req, res, next) => {
  req.filePath = decodeURIComponent(req.params[0]);
  next();
}, analyticsController.getFileAnalytics);

module.exports = router;
