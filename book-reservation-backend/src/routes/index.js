const router = require('express').Router();

router.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));
router.use('/books', require('./books.routes'));
router.use('/reservations', require('./reservations.routes'));
router.use('/members', require('./members.routes'));

module.exports = router;
