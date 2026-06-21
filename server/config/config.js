const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const rootDir = path.join(__dirname, '../..');
const isVercel = Boolean(process.env.VERCEL);

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isVercel,
  workspacePath: isVercel
    ? path.join('/tmp', 'system-inspector-workspace')
    : path.resolve(process.env.WORKSPACE_PATH || path.join(rootDir, 'workspace')),
  logsPath: isVercel
    ? path.join('/tmp', 'system-inspector-data', 'activity-logs.json')
    : path.join(__dirname, '../data/activity-logs.json'),
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
