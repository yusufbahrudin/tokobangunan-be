const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { unauthorizedResponse, forbiddenResponse } = require('../utils/response');

/**
 * Verifikasi JWT token dari header Authorization
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse(res, 'Token autentikasi diperlukan');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return unauthorizedResponse(res, 'Token telah kedaluwarsa');
      }
      return unauthorizedResponse(res, 'Token tidak valid');
    }

    const user = await User.findOne({
      where: { id: decoded.id, is_active: true },
      attributes: { exclude: ['password', 'refresh_token'] },
    });

    if (!user) {
      return unauthorizedResponse(res, 'Pengguna tidak ditemukan atau tidak aktif');
    }

    req.user = user;
    next();
  } catch (error) {
    return unauthorizedResponse(res, 'Autentikasi gagal');
  }
};

/**
 * Batasi akses hanya untuk admin
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return forbiddenResponse(res, 'Hanya admin yang dapat mengakses fitur ini');
  }
  next();
};

/**
 * Opsional authenticate – request tetap lanjut meski tidak ada token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({
          where: { id: decoded.id, is_active: true },
          attributes: { exclude: ['password', 'refresh_token'] },
        });
        if (user) req.user = user;
      } catch {
        // Abaikan token tidak valid pada opsional auth
      }
    }
    next();
  } catch {
    next();
  }
};

module.exports = { authenticate, adminOnly, optionalAuth };
