const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const service = require('../services/reservation.service');
const { toPositiveInt, STATUSES } = require('../utils/validators');

// GET /api/reservations?status=Issued&member_id=1&book_id=2&overdue=true
exports.list = asyncHandler(async (req, res) => {
  const { status, member_id, book_id, overdue } = req.query;
  const errors = [];

  if (status !== undefined && !STATUSES.includes(status)) errors.push({ field: 'status', message: `status must be one of: ${STATUSES.join(', ')}.` });
  if (member_id !== undefined && !toPositiveInt(member_id)) errors.push({ field: 'member_id', message: 'member_id must be a positive whole number.' });
  if (book_id !== undefined && !toPositiveInt(book_id)) errors.push({ field: 'book_id', message: 'book_id must be a positive whole number.' });
  if (overdue !== undefined && !['true', 'false'].includes(overdue)) errors.push({ field: 'overdue', message: 'overdue must be true or false.' });
  if (errors.length) throw new AppError(400, 'Validation failed.', errors);

  const rows = await service.listReservations({
    status,
    member_id: member_id && toPositiveInt(member_id),
    book_id: book_id && toPositiveInt(book_id),
    overdueOnly: overdue === 'true',
  });
  res.json({ success: true, count: rows.length, data: rows });
});

// GET /api/reservations/:id
exports.getOne = asyncHandler(async (req, res) => {
  const reservation = await service.getReservationById(req.params.id);
  if (!reservation) throw new AppError(404, 'Reservation not found.');
  res.json({ success: true, data: reservation });
});

// POST /api/reservations   { book_id, member_id }
exports.reserve = asyncHandler(async (req, res) => {
  const reservation = await service.reserveBook(req.reservationInput);
  res.status(201).json({ success: true, message: 'Book reserved. One copy is now held for the member.', data: reservation });
});

// POST /api/reservations/:id/cancel
exports.cancel = asyncHandler(async (req, res) => {
  const reservation = await service.cancelReservation(req.params.id);
  res.json({ success: true, message: 'Reservation cancelled. The copy is available again.', data: reservation });
});

// POST /api/reservations/:id/issue   { loan_days?: 14 }
exports.issue = asyncHandler(async (req, res) => {
  const reservation = await service.issueReservation(req.params.id, req.issueInput.loan_days);
  res.json({ success: true, message: `Book issued. Due on ${reservation.due_date}.`, data: reservation });
});

// POST /api/reservations/:id/return
exports.returnBook = asyncHandler(async (req, res) => {
  const reservation = await service.returnReservation(req.params.id);
  const late = reservation.days_overdue > 0;
  res.json({
    success: true,
    message: late
      ? `Book returned ${reservation.days_overdue} day(s) late. The copy is available again.`
      : 'Book returned on time. The copy is available again.',
    data: reservation,
  });
});
