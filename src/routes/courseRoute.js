const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");


router.get("/getCourse", courseController.getAllCourses);
router.get("/getCourse/:userId", courseController.getCourseById);
router.post("/create/:courseId", courseController.createModuleWithVideoUrl);
router.get("/modules/:courseId/:userId", courseController.getModulesByUserCourseId);
router.post("/modules-progress/updatewatchtime",courseController.updateProgress);
router.post("/assessment/submit", courseController.submitAssessment);
router.get("/assessment/submitted/:userId/:courseId/:moduleId",courseController.getSubmittedAssessment);
router.post("/certificate/generate",courseController.generateCertificateOnDemand);

module.exports = router;