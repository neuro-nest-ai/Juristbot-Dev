const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();


router.post('/signup', userController.signup);
router.post('/verifyotp',userController.verifyOtp);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.post('/sentotpemail',userController.sendotpsmail);
router.post('/sendotpmobile',userController.sendotpforgetpass);
router.post('/verifyotp&password',userController.verifypassword);
router.post('/user-report', userController.reportUser);
router.get('/calsprofile', userController.calsprofile);
router.get('/getProfile', userController.getProfileweb);
router.get('/getmemberlisting', userController.getmemberlisting);
router.get('/getmemberlistingem', userController.getmemberlistingem);
router.post('/submit-review', userController.submitReview);
router.get('/get-reviews', userController.getReviews);



module.exports = router;
