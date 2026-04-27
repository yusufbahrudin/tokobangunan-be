const { Op } = require('sequelize');
const { User } = require('../models');
const { getPagination } = require('../utils/helpers');
const {
  successResponse,
  paginatedResponse,
  notFoundResponse,
  errorResponse,
} = require('../utils/response');
const path = require('path');
const fs = require('fs');

/**
 * GET /admin/users – daftar semua pengguna (admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role, is_active } = req.query;
    const { page: p, limit: l, offset } = getPagination(page, limit);

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'refresh_token'] },
      order: [['created_at', 'DESC']],
      limit: l,
      offset,
    });

    return paginatedResponse(res, rows, 'Daftar pengguna berhasil diambil', {
      total: count, page: p, limit: l,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /admin/users/:id – detail pengguna (admin)
 */
const getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'refresh_token'] },
    });
    if (!user) return notFoundResponse(res, 'Pengguna tidak ditemukan');

    return successResponse(res, user, 'Detail pengguna berhasil diambil');
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /admin/users/:id – perbarui pengguna (admin)
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return notFoundResponse(res, 'Pengguna tidak ditemukan');

    const { name, email, role, phone, address, is_active } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (is_active !== undefined) updateData.is_active = is_active === 'true' || is_active === true;

    // Hanya super-admin (atau admin utama) yang bisa ubah role & email
    if (email !== undefined) {
      const exists = await User.findOne({ where: { email, id: { [Op.ne]: user.id } } });
      if (exists) return errorResponse(res, 'Email sudah digunakan', 409);
      updateData.email = email;
    }
    if (role !== undefined) {
      if (!['admin', 'user'].includes(role)) {
        return errorResponse(res, 'Role tidak valid', 400);
      }
      updateData.role = role;
    }

    await user.update(updateData);

    const updated = await User.findByPk(user.id, {
      attributes: { exclude: ['password', 'refresh_token'] },
    });
    return successResponse(res, updated, 'Pengguna berhasil diperbarui');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /admin/users/:id – hapus pengguna (admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return notFoundResponse(res, 'Pengguna tidak ditemukan');

    // Tidak boleh hapus diri sendiri
    if (user.id === req.user.id) {
      return errorResponse(res, 'Tidak dapat menghapus akun sendiri', 400);
    }

    if (user.avatar) {
      const filePath = path.join(process.cwd(), user.avatar);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await user.destroy();
    return successResponse(res, null, 'Pengguna berhasil dihapus');
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /admin/users/:id/toggle-active – aktif/nonaktifkan pengguna (admin)
 */
const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return notFoundResponse(res, 'Pengguna tidak ditemukan');

    if (user.id === req.user.id) {
      return errorResponse(res, 'Tidak dapat menonaktifkan akun sendiri', 400);
    }

    await user.update({ is_active: !user.is_active });
    const status = user.is_active ? 'dinonaktifkan' : 'diaktifkan';
    return successResponse(
      res,
      { id: user.id, is_active: !user.is_active },
      `Pengguna berhasil ${status}`
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserActive,
};
