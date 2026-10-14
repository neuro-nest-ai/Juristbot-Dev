const express = require('express');
const planController = require('../controllers/planController');
const router = express.Router();

router.get('/subscription_plans', planController.SubscriptionPlan);
router.get("/features",planController.Features)
router.post("/control/black-friday-status",planController.Firadyplan)
module.exports = router;
