const router = require('express').Router();
const controller = require('../controllers/reservations.controller');
const { validateIdParam, validateReservation, validateIssue } = require('../middleware/validation');

router.get('/', controller.list);
router.get('/:id', validateIdParam, controller.getOne);
router.post('/', validateReservation, controller.reserve);
router.post('/:id/cancel', validateIdParam, controller.cancel);
router.post('/:id/issue', validateIdParam, validateIssue, controller.issue);
router.post('/:id/return', validateIdParam, controller.returnBook);

module.exports = router;
