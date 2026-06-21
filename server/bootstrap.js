const fs = require('fs/promises');
const path = require('path');
const config = require('./config/config');

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function bootstrap() {
  await fs.mkdir(config.workspacePath, { recursive: true });
  await fs.mkdir(path.dirname(config.logsPath), { recursive: true });

  try {
    await fs.access(config.logsPath);
  } catch {
    await fs.writeFile(config.logsPath, '[]', 'utf-8');
  }

  if (config.isVercel) {
    const seedWorkspace = path.join(config.rootDir, 'workspace');

    try {
      const entries = await fs.readdir(config.workspacePath);
      if (entries.length === 0) {
        await copyDir(seedWorkspace, config.workspacePath);
      }
    } catch {
      // Optional seed; empty workspace is fine on serverless.
    }
  }
}

module.exports = bootstrap;
