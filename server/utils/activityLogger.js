const fs = require('fs/promises');
const path = require('path');
const config = require('../config/config');

async function ensureLogsFile() {
  try {
    await fs.access(config.logsPath);
  } catch {
    await fs.mkdir(path.dirname(config.logsPath), { recursive: true });
    await fs.writeFile(config.logsPath, '[]', 'utf-8');
  }
}

async function readLogs() {
  await ensureLogsFile();
  const content = await fs.readFile(config.logsPath, 'utf-8');
  try {
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function writeLogs(logs) {
  await ensureLogsFile();
  await fs.writeFile(config.logsPath, JSON.stringify(logs, null, 2), 'utf-8');
}

async function logActivity(action, details = {}) {
  const logs = await readLogs();
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    action,
    details,
    timestamp: new Date().toISOString(),
  };

  logs.unshift(entry);

  if (logs.length > 500) {
    logs.length = 500;
  }

  await writeLogs(logs);
  return entry;
}

module.exports = {
  readLogs,
  writeLogs,
  logActivity,
};
