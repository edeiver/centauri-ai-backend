const router = require('express').Router();
const controller = require('../controllers/transaction.controller');
const auth = require('../middlewares/auth');

router.post('/', auth, controller.create);
router.get('/', auth, controller.getAll);

module.exports = router;