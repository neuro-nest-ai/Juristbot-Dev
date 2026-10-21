const express = require('express');
const controller = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth');
const { orderUpload } = require('../middleware/upload');
const fileController = require('../controllers/file.controller');

const router = express.Router();

router.use(authenticate);

router.get('/my', controller.listMine);
router.post('/:orderId/files', orderUpload.array('files', 5), fileController.uploadOrderFiles);
router.get('/:orderId/files', fileController.listOrderFiles);
router.get('/:orderId/files/:fileId', fileController.downloadOrderFile);
router.get('/:id', controller.getOne);

module.exports = router;
