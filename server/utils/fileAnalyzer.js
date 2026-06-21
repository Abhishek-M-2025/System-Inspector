const fs = require('fs/promises');
const path = require('path');
const config = require('../config/config');

const EXTENSION_MAP = {
  '.js': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'css',
  '.sass': 'css',
  '.less': 'css',
};

function countMatches(content, regex) {
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

function analyzeFileContent(content, ext) {
  const lines = content.split(/\r?\n/);
  const totalLines = lines.length;

  let blankLines = 0;
  let commentLines = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      blankLines++;
      continue;
    }

    if (isCommentLine(trimmed, ext)) {
      commentLines++;
    }
  }

  const functionsCount = countFunctions(content, ext);
  const classesCount = countClasses(content, ext);

  return {
    totalLines,
    blankLines,
    commentLines,
    codeLines: totalLines - blankLines - commentLines,
    functionsCount,
    classesCount,
  };
}

function isCommentLine(trimmed, ext) {
  if (trimmed.startsWith('//') || trimmed.startsWith('#')) return true;
  if (trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('*/')) return true;
  if (ext === '.html' && trimmed.startsWith('<!--')) return true;
  if (ext === '.css' && (trimmed.startsWith('/*') || trimmed.startsWith('*'))) return true;
  return false;
}

function countFunctions(content, ext) {
  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
    return countMatches(content, /\bfunction\s+\w+/g) +
      countMatches(content, /\b(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g) +
      countMatches(content, /\b(?:async\s+)?\w+\s*\([^)]*\)\s*\{/g) -
      countMatches(content, /\b(?:if|for|while|switch|catch)\s*\(/g);
  }
  if (ext === '.html') {
    return countMatches(content, /<script[\s>]/gi);
  }
  return 0;
}

function countClasses(content, ext) {
  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
    return countMatches(content, /\bclass\s+\w+/g);
  }
  return 0;
}

async function analyzeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const stats = await fs.stat(filePath);
  const content = await fs.readFile(filePath, 'utf-8');
  const analysis = analyzeFileContent(content, ext);

  return {
    name: path.basename(filePath),
    path: filePath,
    extension: ext,
    fileType: EXTENSION_MAP[ext] || 'other',
    size: stats.size,
    sizeFormatted: require('./formatters').formatBytes(stats.size),
    lastModified: stats.mtime.toISOString(),
    ...analysis,
  };
}

async function scanProject(dirPath, stats = null) {
  const result = stats || {
    totalFiles: 0,
    totalFolders: 0,
    javascriptFiles: 0,
    htmlFiles: 0,
    cssFiles: 0,
    otherFiles: 0,
    totalSize: 0,
  };

  let entries;
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true });
  } catch {
    return result;
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.gitkeep') continue;

    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      result.totalFolders++;
      await scanProject(fullPath, result);
    } else if (entry.isFile()) {
      result.totalFiles++;
      const ext = path.extname(entry.name).toLowerCase();
      const fileStats = await fs.stat(fullPath);
      result.totalSize += fileStats.size;

      if (ext === '.js' || ext === '.mjs' || ext === '.cjs') result.javascriptFiles++;
      else if (ext === '.html' || ext === '.htm') result.htmlFiles++;
      else if (ext === '.css' || ext === '.scss') result.cssFiles++;
      else result.otherFiles++;
    }
  }

  return result;
}

function resolveSafePath(relativePath) {
  const workspace = config.workspacePath;
  const resolved = path.resolve(workspace, relativePath || '');

  if (!resolved.startsWith(workspace)) {
    throw new Error('Access denied: path outside workspace');
  }

  return resolved;
}

module.exports = {
  analyzeFile,
  analyzeFileContent,
  scanProject,
  resolveSafePath,
  EXTENSION_MAP,
};
