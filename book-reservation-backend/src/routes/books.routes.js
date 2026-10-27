const router = require('express').Router();
const controller = require('../controllers/books.controller');
const { validateIdParam, validateBookCreate, validateBookUpdate } = require('../middleware/validation');

router.get('/', controller.list);
router.get('/:id', validateIdParam, controller.getOne);
router.post('/', validateBookCreate, controller.create);
router.put('/:id', validateIdParam, validateBookUpdate, controller.update);

module.exports = router;
