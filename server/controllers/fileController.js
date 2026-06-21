const fileService = require('../services/fileService');

async function listDirectory(req, res, next) {
  try {
    const showHidden = req.query.showHidden === 'true';
    const data = await fileService.listDirectory(req.query.path || '', showHidden);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getFileTree(req, res, next) {
  try {
    const depth = parseInt(req.query.depth, 10) || 4;
    const showHidden = req.query.showHidden === 'true';
    const data = await fileService.getFileTree('', depth, showHidden);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function readFile(req, res, next) {
  try {
    const data = await fileService.readFile(req.filePath);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function createFile(req, res, next) {
  try {
    const { path: filePath, content = '' } = req.body;
    if (!filePath) return res.status(400).json({ success: false, error: 'Path is required' });

    const data = await fileService.createFile(filePath, content);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function updateFile(req, res, next) {
  try {
    const { content } = req.body;
    if (content === undefined) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    const data = await fileService.updateFile(req.filePath, content);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function deleteFile(req, res, next) {
  try {
    const data = await fileService.deleteFile(req.filePath);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function renameItem(req, res, next) {
  try {
    const { newName } = req.body;
    if (!newName) return res.status(400).json({ success: false, error: 'newName is required' });

    const data = await fileService.renameItem(req.filePath, newName);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function createFolder(req, res, next) {
  try {
    const { path: folderPath } = req.body;
    if (!folderPath) return res.status(400).json({ success: false, error: 'Path is required' });

    const data = await fileService.createFolder(folderPath);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function deleteFolder(req, res, next) {
  try {
    const data = await fileService.deleteFolder(req.filePath);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function searchFiles(req, res, next) {
  try {
    const { q = '' } = req.query;
    if (!q) return res.json({ success: true, data: [] });

    const data = await fileService.searchFiles(q);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
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
