const logger = require('../config/logger');

/**
 * Global error handler – tangani semua error yang tidak ditangani controller
 */
const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message}`, { stack: err.stack, url: req.originalUrl });

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      message: 'Validasi data gagal',
      errors,
    });
  }

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return res.status(409).json({
      success: false,
      message: `${field} sudah digunakan`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Token tidak valid' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token telah kedaluwarsa' });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Ukuran file melebihi batas yang diizinkan (maks 5 MB)',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Field upload tidak dikenali',
    });
  }

  // Default 500
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan pada server'
      : err.message || 'Terjadi kesalahan pada server';

  return res.status(statusCode).json({ success: false, message });
};

/**
 * Handler 404 – route tidak ditemukan
 */
const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
};

module.exports = { errorHandler, notFoundHandler };
