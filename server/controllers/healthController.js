const healthService = require('../services/healthService');

async function getHealthScore(req, res, next) {
  try {
    const data = await healthService.getHealthScore();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = { getHealthScore };
