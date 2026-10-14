const express = require('express');
const router = express.Router();
const draftController= require('../controllers/legalDraftController');



router.post('/upload', draftController.uploadFile);

router.get('/view/:fileName', draftController.viewFile);

router.put('/uploads/:file_path', draftController.updateUploadStatus);

router.get('/wallet/:user_id', draftController.getWallet);

router.get('/status/:user_id', draftController.getStatusByUser);


module.exports = router;