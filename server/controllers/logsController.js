const { readLogs, writeLogs } = require('../utils/activityLogger');

async function getLogs(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const logs = await readLogs();
    res.json({ success: true, data: logs.slice(0, limit) });
  } catch (error) {
    next(error);
  }
}

async function clearLogs(req, res, next) {
  try {
    await writeLogs([]);
    res.json({ success: true, data: { cleared: true } });
  } catch (error) {
    next(error);
  }
}

module.exports = { getLogs, clearLogs };
