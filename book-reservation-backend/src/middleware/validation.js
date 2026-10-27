const AppError = require('../utils/AppError');
const {
  toPositiveInt, validateBook, validateReservationInput, validateLoanDays,
} = require('../utils/validators');

function validateIdParam(req, res, next) {
  const id = toPositiveInt(req.params.id);
  if (!id) return next(new AppError(400, 'The id in the URL must be a positive whole number.'));
  req.params.id = id;
  next();
}

const fail = (errors) => new AppError(400, 'Validation failed.', errors);

exports.validateIdParam = validateIdParam;

exports.validateBookCreate = (req, res, next) => {
  const { errors, value } = validateBook(req.body, { partial: false });
  if (errors.length) return next(fail(errors));
  req.bookInput = value;
  next();
};

exports.validateBookUpdate = (req, res, next) => {
  const { errors, value } = validateBook(req.body, { partial: true });
  if (errors.length) return next(fail(errors));
  req.bookInput = value;
  next();
};

exports.validateReservation = (req, res, next) => {
  const { errors, value } = validateReservationInput(req.body);
  if (errors.length) return next(fail(errors));
  req.reservationInput = value;
  next();
};

exports.validateIssue = (req, res, next) => {
  const { errors, value } = validateLoanDays(req.body || {});
  if (errors.length) return next(fail(errors));
  req.issueInput = value;
  next();
};
