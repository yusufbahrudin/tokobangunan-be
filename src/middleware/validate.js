const { validationResult } = require('express-validator');
const { validationErrorResponse } = require('../utils/response');

/**
 * Middleware pemroses hasil validasi express-validator.
 * Letakkan setelah array aturan validasi di route.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return validationErrorResponse(res, formatted);
  }
  next();
};

module.exports = validate;
