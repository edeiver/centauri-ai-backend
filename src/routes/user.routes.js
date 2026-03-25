const router = require('express').Router();
const controller = require('../controllers/user.controller');

router.get('/:userId', controller.getUser);

module.exports = router;
