const fs = require('fs/promises');
const path = require('path');
const config = require('../config/config');
const { resolveSafePath } = require('../utils/fileAnalyzer');
const { logActivity } = require('../utils/activityLogger');
const { formatBytes, formatDate } = require('../utils/formatters');

async function ensureWorkspace() {
  await fs.mkdir(config.workspacePath, { recursive: true });
}

async function listDirectory(relativePath = '', showHidden = false) {
  await ensureWorkspace();
  const dirPath = resolveSafePath(relativePath);
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  const items = await Promise.all(
    entries
      .filter((entry) => showHidden || !entry.name.startsWith('.') || entry.name === '.gitkeep')
      .map(async (entry) => {
      const itemPath = path.join(dirPath, entry.name);
      const relPath = path.relative(config.workspacePath, itemPath).replace(/\\/g, '/');
      const stats = await fs.stat(itemPath);

      return {
        name: entry.name,
        path: relPath,
        type: entry.isDirectory() ? 'directory' : 'file',
        size: entry.isFile() ? stats.size : null,
        sizeFormatted: entry.isFile() ? formatBytes(stats.size) : null,
        modified: stats.mtime.toISOString(),
        modifiedFormatted: formatDate(stats.mtime),
      };
    })
  );

  items.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return {
    path: relativePath.replace(/\\/g, '/') || '/',
    items,
  };
}

async function getFileTree(relativePath = '', depth = 3, showHidden = false) {
  await ensureWorkspace();

  async function buildTree(relPath, currentDepth) {
    if (currentDepth > depth) return null;

    const dirPath = resolveSafePath(relPath);
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    const children = [];
    for (const entry of entries) {
      if (!showHidden && entry.name.startsWith('.') && entry.name !== '.gitkeep') continue;

      const childRel = path.join(relPath, entry.name).replace(/\\/g, '/');
      const node = {
        name: entry.name,
        path: childRel,
        type: entry.isDirectory() ? 'directory' : 'file',
      };

      if (entry.isDirectory()) {
        node.children = await buildTree(childRel, currentDepth + 1) || [];
      }

      children.push(node);
    }

    children.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return children;
  }

  return {
    name: 'workspace',
    path: '',
    type: 'directory',
    children: await buildTree('', 0) || [],
  };
}

async function readFile(relativePath) {
  const filePath = resolveSafePath(relativePath);
  const stats = await fs.stat(filePath);

  if (!stats.isFile()) {
    throw new Error('Path is not a file');
  }

  const content = await fs.readFile(filePath, 'utf-8');

  return {
    path: relativePath.replace(/\\/g, '/'),
    name: path.basename(filePath),
    content,
    size: stats.size,
    sizeFormatted: formatBytes(stats.size),
    modified: stats.mtime.toISOString(),
  };
}

async function createFile(relativePath, content = '') {
  const filePath = resolveSafePath(relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  try {
    await fs.access(filePath);
    throw new Error('File already exists');
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  await fs.writeFile(filePath, content, 'utf-8');
  await logActivity('File Created', { path: relativePath });

  return { path: relativePath, message: 'File created successfully' };
}

async function updateFile(relativePath, content) {
  const filePath = resolveSafePath(relativePath);
  await fs.writeFile(filePath, content, 'utf-8');
  await logActivity('File Updated', { path: relativePath });

  return { path: relativePath, message: 'File updated successfully' };
}

async function deleteFile(relativePath) {
  const filePath = resolveSafePath(relativePath);
  const stats = await fs.stat(filePath);

  if (stats.isDirectory()) {
    throw new Error('Use delete folder endpoint for directories');
  }

  await fs.unlink(filePath);
  await logActivity('File Deleted', { path: relativePath });

  return { path: relativePath, message: 'File deleted successfully' };
}

async function renameItem(relativePath, newName) {
  const oldPath = resolveSafePath(relativePath);
  const dir = path.dirname(oldPath);
  const newPath = path.join(dir, newName);

  if (!newPath.startsWith(config.workspacePath)) {
    throw new Error('Access denied');
  }

  await fs.rename(oldPath, newPath);
  const newRel = path.relative(config.workspacePath, newPath).replace(/\\/g, '/');
  await logActivity('File Renamed', { from: relativePath, to: newRel });

  return { path: newRel, message: 'Renamed successfully' };
}

async function createFolder(relativePath) {
  const dirPath = resolveSafePath(relativePath);
  await fs.mkdir(dirPath, { recursive: true });
  await logActivity('Folder Created', { path: relativePath });

  return { path: relativePath, message: 'Folder created successfully' };
}

async function deleteFolder(relativePath) {
  const dirPath = resolveSafePath(relativePath);
  const stats = await fs.stat(dirPath);

  if (!stats.isDirectory()) {
    throw new Error('Path is not a directory');
  }

  await fs.rm(dirPath, { recursive: true, force: true });
  await logActivity('Folder Deleted', { path: relativePath });

  return { path: relativePath, message: 'Folder deleted successfully' };
}

async function searchFiles(query, relativePath = '') {
  await ensureWorkspace();
  const results = [];

  async function walk(dir) {
    const dirPath = resolveSafePath(dir);
    let entries;

    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.gitkeep') continue;

      const rel = path.join(dir, entry.name).replace(/\\/g, '/');

      if (entry.name.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          name: entry.name,
          path: rel,
          type: entry.isDirectory() ? 'directory' : 'file',
        });
      }

      if (entry.isDirectory()) {
        await walk(rel);
      }
    }
  }

  await walk(relativePath);
  return results.slice(0, 50);
}

module.exports = {
  listDirectory,
  getFileTree,
  readFile,
  createFile,
  updateFile,
  deleteFile,
  renameItem,
  createFolder,
  deleteFolder,
  searchFiles,
};
