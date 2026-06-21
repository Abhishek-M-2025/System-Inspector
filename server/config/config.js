const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const rootDir = path.join(__dirname, '../..');

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  workspacePath: path.resolve(
    process.env.WORKSPACE_PATH || path.join(rootDir, 'workspace')
  ),
  logsPath: path.join(__dirname, '../data/activity-logs.json'),
  rootDir,
  sensitiveEnvPatterns: [
    /password/i,
    /secret/i,
    /token/i,
    /api[_-]?key/i,
    /auth/i,
    /credential/i,
    /private[_-]?key/i,
  ],
};
