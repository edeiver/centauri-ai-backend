const router = require('express').Router();
const controller = require('../controllers/ai.controller');
const auth = require('../middleware/auth');

router.post('/insights', auth, controller.getInsights);

module.exports = router;