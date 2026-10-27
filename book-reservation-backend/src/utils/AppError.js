// An error thrown on purpose; errorHandler turns it into a JSON response.
class AppError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // optional: [{ field, message }]
  }
}
module.exports = AppError;
