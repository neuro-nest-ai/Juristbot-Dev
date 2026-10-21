const express = require('express');
const controller = require('../controllers/request.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { upload } = require('../middleware/upload');
const fileController = require('../controllers/file.controller');

const router = express.Router();

router.use(authenticate);

router.get('/feed', requireRole('advocate', 'admin'), controller.feed);
router.get('/my', requireRole('buyer', 'admin'), controller.listMine);
router.post('/', requireRole('buyer', 'admin'), controller.create);
router.get('/:id', controller.getOne);
router.patch('/:id', requireRole('buyer', 'admin'), controller.update);
router.post('/:id/cancel', requireRole('buyer', 'admin'), controller.cancel);
router.post('/:requestId/files', requireRole('buyer', 'admin'), upload.array('files', 5), fileController.uploadFiles);
router.get('/:requestId/files', fileController.listFiles);
router.get('/:requestId/files/:fileId', fileController.downloadFile);

module.exports = router;
