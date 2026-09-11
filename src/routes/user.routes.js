const router = require('express').Router();
const controller = require('../controllers/user.controller');
const auth = require('../middlewares/auth');

router.get('/me', auth, controller.getMe);
router.get('/:userId', auth, controller.getUser);

module.exports = router;
