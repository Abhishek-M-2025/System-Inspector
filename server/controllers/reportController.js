const reportService = require('../services/reportService');

async function getDashboard(req, res, next) {
  try {
    const data = await reportService.getDashboardData();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function generateReport(req, res, next) {
  try {
    const { type } = req.params;
    const data = await reportService.generateReport(type);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = { getDashboard, generateReport };
