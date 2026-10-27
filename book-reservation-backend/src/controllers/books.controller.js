const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const service = require('../services/book.service');
const { parsePagination } = require('../utils/validators');

// GET /api/books?search=clean&category=Databases&available=true&page=1&limit=20
exports.list = asyncHandler(async (req, res) => {
  const { errors, value } = parsePagination(req.query);
  const { search, category, available } = req.query;

  if (available !== undefined && !['true', 'false'].includes(available)) {
    errors.push({ field: 'available', message: 'available must be true or false.' });
  }
  if (errors.length) throw new AppError(400, 'Validation failed.', errors);

  const { total, rows } = await service.listBooks({
    search: typeof search === 'string' ? search.trim() : '',
    category: typeof category === 'string' ? category.trim() : '',
    availableOnly: available === 'true',
    ...value,
  });

  res.json({
    success: true,
    page: value.page,
    limit: value.limit,
    total,
    total_pages: Math.ceil(total / value.limit),
    data: rows,
  });
});

// GET /api/books/:id
exports.getOne = asyncHandler(async (req, res) => {
  const book = await service.getBookById(req.params.id);
  if (!book) throw new AppError(404, 'Book not found.');
  res.json({ success: true, data: book });
});

// POST /api/books
exports.create = asyncHandler(async (req, res) => {
  const book = await service.createBook(req.bookInput);
  res.status(201).json({ success: true, message: 'Book added to the inventory.', data: book });
});

// PUT /api/books/:id   (send only the fields you want to change)
exports.update = asyncHandler(async (req, res) => {
  const book = await service.updateBook(req.params.id, req.bookInput);
  res.json({ success: true, message: 'Book updated.', data: book });
});
