const envService = require('../services/envService');

function getEnvironmentVariables(req, res, next) {
  try {
    const { search = '', filter = 'all', mask = 'true' } = req.query;
    const data = envService.getEnvironmentVariables({
      search,
      filter,
      mask: mask !== 'false',
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = { getEnvironmentVariables };
