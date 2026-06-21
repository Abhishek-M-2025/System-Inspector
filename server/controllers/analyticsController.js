const analyticsService = require('../services/analyticsService');

async function getProjectAnalytics(req, res, next) {
  try {
    const data = await analyticsService.getProjectAnalytics();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getFileAnalytics(req, res, next) {
  try {
    const data = await analyticsService.getFileAnalytics(req.filePath);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getOverview(req, res, next) {
  try {
    const data = await analyticsService.getAnalyticsOverview();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProjectAnalytics,
  getFileAnalytics,
  getOverview,
};
