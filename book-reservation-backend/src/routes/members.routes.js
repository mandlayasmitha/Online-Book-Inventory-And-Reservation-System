const router = require('express').Router();
const controller = require('../controllers/members.controller');

router.get('/', controller.list);

module.exports = router;
