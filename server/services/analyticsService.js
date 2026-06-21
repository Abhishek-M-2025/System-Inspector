const config = require('../config/config');
const { analyzeFile, scanProject, resolveSafePath } = require('../utils/fileAnalyzer');
const { formatBytes } = require('../utils/formatters');

async function getFileAnalytics(relativePath) {
  const filePath = resolveSafePath(relativePath);
  const analysis = await analyzeFile(filePath);
  return analysis;
}

async function getProjectAnalytics() {
  const stats = await scanProject(config.workspacePath);

  return {
    ...stats,
    totalSizeFormatted: formatBytes(stats.totalSize),
    workspacePath: config.workspacePath,
  };
}

async function getAnalyticsOverview() {
  const project = await getProjectAnalytics();
  return { project };
}

module.exports = {
  getFileAnalytics,
  getProjectAnalytics,
  getAnalyticsOverview,
};
