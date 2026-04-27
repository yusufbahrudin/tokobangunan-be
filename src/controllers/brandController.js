const { Brand, Product } = require('../models');
const { createSlug, getPagination } = require('../utils/helpers');
const {
  successResponse,
  paginatedResponse,
  notFoundResponse,
  errorResponse,
} = require('../utils/response');
const path = require('path');
const fs = require('fs');

/**
 * GET /brands – daftar semua brand
 */
const getBrands = async (req, res, next) => {
  try {
    const { page, limit, search, is_active } = req.query;
    const where = {};

    if (search) {
      const { Op } = require('sequelize');
      where.name = { [Op.like]: `%${search}%` };
    }
    if (is_active !== undefined) where.is_active = is_active === 'true';

    if (page || limit) {
      const { page: p, limit: l, offset } = getPagination(page, limit);
      const { count, rows } = await Brand.findAndCountAll({
        where,
        order: [['name', 'ASC']],
        limit: l,
        offset,
      });
      return paginatedResponse(res, rows, 'Daftar brand berhasil diambil', {
        total: count, page: p, limit: l,
      });
    }

    const brands = await Brand.findAll({
      where,
      order: [['name', 'ASC']],
    });

    return successResponse(res, brands, 'Daftar brand berhasil diambil');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /brands/:id – detail brand by ID atau slug
 */
const getBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const where = id.match(/^[0-9a-f-]{36}$/i) ? { id } : { slug: id };

    const brand = await Brand.findOne({ where });
    if (!brand) return notFoundResponse(res, 'Brand tidak ditemukan');

    return successResponse(res, brand, 'Detail brand berhasil diambil');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /brands – buat brand baru (admin)
 */
const createBrand = async (req, res, next) => {
  try {
    const { name, description, is_active } = req.body;

    let slug = createSlug(name);
    const existing = await Brand.findOne({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const logo = req.file ? `/uploads/brands/${req.file.filename}` : null;

    const brand = await Brand.create({
      name,
      slug,
      description: description || null,
      logo,
      is_active: is_active !== undefined ? is_active === 'true' || is_active === true : true,
    });

    return successResponse(res, brand, 'Brand berhasil dibuat', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /brands/:id – perbarui brand (admin)
 */
const updateBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return notFoundResponse(res, 'Brand tidak ditemukan');

    const { name, description, is_active } = req.body;
    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
      const { Op } = require('sequelize');
      let slug = createSlug(name);
      const dup = await Brand.findOne({ where: { slug, id: { [Op.ne]: brand.id } } });
      updateData.slug = dup ? `${slug}-${Date.now()}` : slug;
    }
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active === 'true' || is_active === true;

    if (req.file) {
      if (brand.logo) {
        const old = path.join(process.cwd(), brand.logo);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      updateData.logo = `/uploads/brands/${req.file.filename}`;
    }

    await brand.update(updateData);
    return successResponse(res, brand, 'Brand berhasil diperbarui');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /brands/:id – hapus brand (admin)
 */
const deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return notFoundResponse(res, 'Brand tidak ditemukan');

    const productCount = await Product.count({ where: { brand_id: brand.id } });
    if (productCount > 0) {
      return errorResponse(
        res,
        `Brand tidak dapat dihapus karena masih memiliki ${productCount} produk`,
        409
      );
    }

    if (brand.logo) {
      const filePath = path.join(process.cwd(), brand.logo);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await brand.destroy();
    return successResponse(res, null, 'Brand berhasil dihapus');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
};
