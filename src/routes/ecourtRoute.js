const express = require('express');
const router = express.Router();
const ecourtController = require('../controllers/ecourtcontroller');

// ⚠️ Put Jurist Bot's existing auth middleware here so req.user is set, e.g.
// const { verifyToken } = require('../middleware/auth');
// router.use(verifyToken);

/* Simple per-user limit: every eCourts call costs credits. 60 requests / minute. */
const hits = new Map();
function ecourtRateLimit(req, res, next) {
  const u = req.user || {};
  const key = String(u.id || u.userId || u._id || req.ip);
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < 60000);
  if (recent.length >= 60) {
    res.set('Retry-After', '30');
    return res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many eCourts requests. Please wait a minute.' } });
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 20000) hits.clear();
  return next();
}
router.use(ecourtRateLimit);

/* ---------- Reference ---------- */
router.get('/search/capabilities', ecourtController.getSearchCapabilities);
router.get('/enums', ecourtController.getEnums);

/* ---------- Cases & orders ---------- */
router.get('/search', ecourtController.searchCases);
router.post('/cases/bulk-refresh', ecourtController.bulkRefresh);
router.post('/cases/bulk-refresh-status', ecourtController.bulkRefreshStatus);
router.get('/cases/:cnr', ecourtController.getCaseDetail);
router.post('/cases/:cnr/refresh', ecourtController.refreshCase);
router.get('/cases/:cnr/orders/:file/ai', ecourtController.getOrderAi);
router.get('/cases/:cnr/orders/:file/markdown', ecourtController.getOrderMarkdown);
router.get('/cases/:cnr/orders/:file/pdf', ecourtController.downloadOrderPdf);

/* ---------- Cause list ---------- */
router.get('/causelist/court-structure/states', ecourtController.getStates);
router.get('/causelist/court-structure/states/:state/districts', ecourtController.getDistricts);
router.get('/causelist/court-structure/states/:state/districts/:district/complexes', ecourtController.getComplexes);
router.get('/causelist/court-structure/states/:state/districts/:district/complexes/:complex/courts', ecourtController.getCourts);
router.get('/causelist/available-dates', ecourtController.getAvailableDates);
router.get('/causelist/search', ecourtController.searchCauseList);
router.post('/causelist/cnr-batch', ecourtController.checkCnrBatch);

/* ---------- LegalCheck ---------- */
router.get('/legal-check/models', ecourtController.getLegalCheckModels);
router.get('/legal-check', ecourtController.listLegalChecks);
router.post('/legal-check', ecourtController.submitLegalCheck);
router.get('/legal-check/:code', ecourtController.getLegalCheckStatus);
router.get('/legal-check/:code/report', ecourtController.getLegalCheckReport);
router.get('/legal-check/:code/log', ecourtController.getLegalCheckLog);

/* ---------- Electoral (EPIC verify only) ---------- */
router.get('/electoral/capabilities', ecourtController.getElectoralCapabilities);
router.post('/electoral/epic/verify', ecourtController.verifyEpic);

/* ---------- Tracker & WhatsApp alerts ---------- */
router.get('/tracker/cases', ecourtController.listTrackedCases);
router.post('/tracker/cases', ecourtController.trackCase);
router.patch('/tracker/cases/:id', ecourtController.updateTrackedCase);
router.delete('/tracker/cases/:id', ecourtController.untrackCase);
router.get('/tracker/alerts', ecourtController.listAlerts);
router.post('/tracker/alerts/:id/resend', ecourtController.resendAlert);
router.post('/tracker/sync', ecourtController.syncNow);

module.exports = router;