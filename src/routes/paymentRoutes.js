const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/payment-history/:userid', userController.getPaymentHistory);
router.get('/invoice/:userid', userController.getInvoicePdf);
router.get('/getprofile', userController.getProfile);
router.post('/updateprofile', upload.single("profile_img"), userController.updateProfile);
router.get("/active-plan/:user_id", userController.activeplan);
router.post("/updatesource/:user_id", userController.sourceupdate);
router.post('/verifywhatsapp', userController.verifywhatsapp);
router.post('/confirmotp', userController.confirmOtp);
router.post('/listingupdateprofile', upload.single("profile_img"), userController.listingupdateprofile);
module.exports = router;