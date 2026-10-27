// Business rules. Values come from .env (loaded in server.js) or fall back to these defaults.
const positiveInt = (value, fallback) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

module.exports = {
  MAX_ACTIVE_PER_MEMBER: positiveInt(process.env.MAX_ACTIVE_RESERVATIONS, 3),
  DEFAULT_LOAN_DAYS: positiveInt(process.env.DEFAULT_LOAN_DAYS, 14),
  MAX_LOAN_DAYS: 60,
  MAX_COPIES: 1000,
};
