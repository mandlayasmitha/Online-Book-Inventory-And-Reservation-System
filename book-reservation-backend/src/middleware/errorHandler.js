const AppError = require('../utils/AppError');

// Every error ends up here and leaves as consistent JSON:
//   { "success": false, "message": "...", "errors": [ { "field", "message" } ] }
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = 500;
  let message = 'Something went wrong on the server.';
  let errors;

  if (err instanceof AppError) {
    status = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err && err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body is not valid JSON.';
  } else if (err && err.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'That record already exists.';
  } else if (err && err.code === 'ER_NO_REFERENCED_ROW_2') {
    status = 400;
    message = 'The book or member referenced does not exist.';
  } else if (err && (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || err.code === 'ER_DATA_OUT_OF_RANGE')) {
    status = 409;
    message = 'That change would make the available copy count inconsistent, so it was refused.';
  } else if (err && (err.code === 'ER_LOCK_DEADLOCK' || err.code === 'ER_LOCK_WAIT_TIMEOUT')) {
    status = 503;
    message = 'The system is busy with other reservations. Please try again.';
  } else if (err && ['ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR'].includes(err.code)) {
    status = 503;
    message = 'The database is not available. Check that MySQL is running and the .env settings are correct.';
  }

  if (status === 500) console.error(err);

  res.status(status).json({ success: false, message, ...(errors ? { errors } : {}) });
}

module.exports = errorHandler;
