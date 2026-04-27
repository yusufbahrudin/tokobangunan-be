const jwt = require('jsonwebtoken');
const { User } = require('../models');
const {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} = require('../utils/response');

// ── Token helpers ────────────────────────────────────────────────────────

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

// ── Controllers ──────────────────────────────────────────────────────────

/**
 * POST /auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return errorResponse(res, 'Email sudah terdaftar', 409);
    }

    const user = await User.create({ name, email, password, phone });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await user.update({ refresh_token: refreshToken });

    return successResponse(
      res,
      { user: user.toJSON(), access_token: accessToken, refresh_token: refreshToken },
      'Registrasi berhasil',
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return unauthorizedResponse(res, 'Email atau password salah');
    }

    if (!user.is_active) {
      return unauthorizedResponse(res, 'Akun Anda telah dinonaktifkan');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return unauthorizedResponse(res, 'Email atau password salah');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await user.update({ refresh_token: refreshToken });

    return successResponse(
      res,
      { user: user.toJSON(), access_token: accessToken, refresh_token: refreshToken },
      'Login berhasil'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/refresh-token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return unauthorizedResponse(res, 'Refresh token diperlukan');
    }

    let decoded;
    try {
      decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return unauthorizedResponse(res, 'Refresh token tidak valid atau kedaluwarsa');
    }

    const user = await User.findOne({
      where: { id: decoded.id, refresh_token, is_active: true },
    });

    if (!user) {
      return unauthorizedResponse(res, 'Refresh token tidak valid');
    }

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    await user.update({ refresh_token: newRefreshToken });

    return successResponse(
      res,
      { access_token: accessToken, refresh_token: newRefreshToken },
      'Token diperbarui'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/logout
 */
const logout = async (req, res, next) => {
  try {
    await req.user.update({ refresh_token: null });
    return successResponse(res, null, 'Logout berhasil');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /auth/me
 */
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, req.user, 'Data profil berhasil diambil');
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /auth/me – update profil sendiri
 */
const updateMe = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    await req.user.update(updateData);
    const updated = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'refresh_token'] },
    });

    return successResponse(res, updated, 'Profil berhasil diperbarui');
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    const user = await User.findByPk(req.user.id);
    const isMatch = await user.comparePassword(current_password);
    if (!isMatch) {
      return errorResponse(res, 'Password lama tidak sesuai', 400);
    }

    await user.update({ password: new_password });
    return successResponse(res, null, 'Password berhasil diubah');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateMe,
  changePassword,
};
