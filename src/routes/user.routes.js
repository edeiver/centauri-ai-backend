const router = require('express').Router();
const controller = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

router.get('/:userId', authController.verifyToken, controller.getUser);

module.exports = router;
