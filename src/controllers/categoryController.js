const { Category, Product } = require('../models');
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
 * GET /categories – semua kategori
 */
const getCategories = async (req, res, next) => {
  try {
    const { page, limit, search, parent_id, is_active } = req.query;

    const where = {};
    if (search) {
      const { Op } = require('sequelize');
      where.name = { [Op.like]: `%${search}%` };
    }
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (parent_id === 'null' || parent_id === '') {
      where.parent_id = null;
    } else if (parent_id) {
      where.parent_id = parent_id;
    }

    if (page || limit) {
      const { page: p, limit: l, offset } = getPagination(page, limit);
      const { count, rows } = await Category.findAndCountAll({
        where,
        include: [
          { model: Category, as: 'children', attributes: ['id', 'name', 'slug', 'image'] },
        ],
        order: [['sort_order', 'ASC'], ['name', 'ASC']],
        limit: l,
        offset,
      });
      return paginatedResponse(res, rows, 'Daftar kategori berhasil diambil', {
        total: count, page: p, limit: l,
      });
    }

    const categories = await Category.findAll({
      where,
      include: [
        { model: Category, as: 'children', attributes: ['id', 'name', 'slug', 'image'] },
      ],
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
    });

    return successResponse(res, categories, 'Daftar kategori berhasil diambil');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /categories/:id – detail kategori by ID atau slug
 */
const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const where = id.match(/^[0-9a-f-]{36}$/i) ? { id } : { slug: id };

    const category = await Category.findOne({
      where,
      include: [
        { model: Category, as: 'parent', attributes: ['id', 'name', 'slug'] },
        { model: Category, as: 'children', attributes: ['id', 'name', 'slug', 'image'] },
      ],
    });

    if (!category) return notFoundResponse(res, 'Kategori tidak ditemukan');

    return successResponse(res, category, 'Detail kategori berhasil diambil');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /categories – buat kategori baru (admin)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, parent_id, is_active, sort_order } = req.body;

    let slug = createSlug(name);
    const existing = await Category.findOne({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const image = req.file ? `/uploads/categories/${req.file.filename}` : null;

    const category = await Category.create({
      name,
      slug,
      description: description || null,
      image,
      parent_id: parent_id || null,
      is_active: is_active !== undefined ? is_active === 'true' || is_active === true : true,
      sort_order: sort_order ? parseInt(sort_order, 10) : 0,
    });

    return successResponse(res, category, 'Kategori berhasil dibuat', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /categories/:id – perbarui kategori (admin)
 */
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return notFoundResponse(res, 'Kategori tidak ditemukan');

    const { name, description, parent_id, is_active, sort_order } = req.body;
    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
      let slug = createSlug(name);
      const { Op } = require('sequelize');
      const dup = await Category.findOne({ where: { slug, id: { [Op.ne]: category.id } } });
      updateData.slug = dup ? `${slug}-${Date.now()}` : slug;
    }
    if (description !== undefined) updateData.description = description;
    if (parent_id !== undefined) updateData.parent_id = parent_id || null;
    if (is_active !== undefined) updateData.is_active = is_active === 'true' || is_active === true;
    if (sort_order !== undefined) updateData.sort_order = parseInt(sort_order, 10);

    if (req.file) {
      // Hapus gambar lama
      if (category.image) {
        const old = path.join(process.cwd(), category.image);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      updateData.image = `/uploads/categories/${req.file.filename}`;
    }

    await category.update(updateData);
    return successResponse(res, category, 'Kategori berhasil diperbarui');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /categories/:id – hapus kategori (admin)
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return notFoundResponse(res, 'Kategori tidak ditemukan');

    const productCount = await Product.count({ where: { category_id: category.id } });
    if (productCount > 0) {
      return errorResponse(
        res,
        `Kategori tidak dapat dihapus karena masih memiliki ${productCount} produk`,
        409
      );
    }

    if (category.image) {
      const filePath = path.join(process.cwd(), category.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await category.destroy();
    return successResponse(res, null, 'Kategori berhasil dihapus');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
