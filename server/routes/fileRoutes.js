const express = require('express');
const fileController = require('../controllers/fileController');

const router = express.Router();

router.get('/', fileController.listDirectory);
router.get('/tree', fileController.getFileTree);
router.get('/search', fileController.searchFiles);

router.get(/^\/read\/(.+)/, (req, res, next) => {
  req.filePath = decodeURIComponent(req.params[0]);
  next();
}, fileController.readFile);

router.put(/^\/file\/(.+)/, (req, res, next) => {
  req.filePath = decodeURIComponent(req.params[0]);
  next();
}, fileController.updateFile);

router.delete(/^\/file\/(.+)/, (req, res, next) => {
  req.filePath = decodeURIComponent(req.params[0]);
  next();
}, fileController.deleteFile);

router.patch(/^\/rename\/(.+)/, (req, res, next) => {
  req.filePath = decodeURIComponent(req.params[0]);
  next();
}, fileController.renameItem);

router.delete(/^\/folder\/(.+)/, (req, res, next) => {
  req.filePath = decodeURIComponent(req.params[0]);
  next();
}, fileController.deleteFolder);

router.post('/file', fileController.createFile);
router.post('/folder', fileController.createFolder);

module.exports = router;
