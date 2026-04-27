const { Op } = require('sequelize');
const { Product, Category, Brand } = require('../models');
const { createSlug, hitungHemat, hitungDiskon, getPagination } = require('../utils/helpers');
const {
  successResponse,
  paginatedResponse,
  errorResponse,
  notFoundResponse,
} = require('../utils/response');
const path = require('path');
const fs = require('fs');

// ── Helpers ──────────────────────────────────────────────────────────────

const formatProduct = (product) => {
  const p = product.toJSON();
  const price = parseFloat(p.price);
  const promoPrice = p.promo_price ? parseFloat(p.promo_price) : null;

  return {
    ...p,
    price,
    promo_price: promoPrice,
    hemat: hitungHemat(price, promoPrice),
    discount_percent: hitungDiskon(price, promoPrice),
    harga_efektif: promoPrice && promoPrice > 0 ? promoPrice : price,
    thumbnail: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
  };
};

// ── Controllers ──────────────────────────────────────────────────────────

/**
 * GET /products – daftar produk dengan filter, search & pagination
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      search,
      category_id,
      brand_id,
      min_price,
      max_price,
      is_active,
      is_featured,
      free_shipping,
      sort = 'created_at',
      order = 'DESC',
    } = req.query;

    const { page: p, limit: l, offset } = getPagination(page, limit);

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }
    if (category_id) where.category_id = category_id;
    if (brand_id) where.brand_id = brand_id;
    if (min_price) where.price = { ...where.price, [Op.gte]: parseFloat(min_price) };
    if (max_price) where.price = { ...where.price, [Op.lte]: parseFloat(max_price) };
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (is_featured !== undefined) where.is_featured = is_featured === 'true';
    if (free_shipping !== undefined) where.free_shipping = free_shipping === 'true';

    const allowedSort = [
      'created_at', 'name', 'price', 'promo_price',
      'rating', 'sold_count', 'stock',
    ];
    const sortField = allowedSort.includes(sort) ? sort : 'created_at';
    const sortOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Brand, as: 'brand', attributes: ['id', 'name', 'slug', 'logo'] },
      ],
      order: [[sortField, sortOrder]],
      limit: l,
      offset,
    });

    return paginatedResponse(
      res,
      rows.map(formatProduct),
      'Daftar produk berhasil diambil',
      { total: count, page: p, limit: l }
    );
  } catch (err) {
    next(err);
  }
};

/**
 * GET /products/:id – detail produk by ID atau slug
 */
const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const where = id.match(/^[0-9a-f-]{36}$/i) ? { id } : { slug: id };

    const product = await Product.findOne({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Brand, as: 'brand', attributes: ['id', 'name', 'slug', 'logo'] },
      ],
    });

    if (!product) return notFoundResponse(res, 'Produk tidak ditemukan');

    return successResponse(res, formatProduct(product), 'Detail produk berhasil diambil');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /products – buat produk baru (admin)
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      name, description, sku, price, promo_price,
      stock, unit, weight,
      shipping_info, shipping_days, free_shipping,
      category_id, brand_id,
      is_active, is_featured,
    } = req.body;

    // Buat slug unik
    let slug = createSlug(name);
    const existingSlug = await Product.findOne({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Proses gambar yang diupload
    const images = req.files
      ? req.files.map((f) => `/uploads/products/${f.filename}`)
      : [];

    const product = await Product.create({
      name,
      slug,
      sku: sku || null,
      description: description || null,
      price: parseFloat(price),
      promo_price: promo_price ? parseFloat(promo_price) : null,
      stock: stock ? parseInt(stock, 10) : 0,
      unit: unit || 'pcs',
      weight: weight ? parseFloat(weight) : 0,
      images,
      shipping_info: shipping_info || null,
      shipping_days: shipping_days ? parseInt(shipping_days, 10) : 3,
      free_shipping: free_shipping === 'true' || free_shipping === true,
      category_id: category_id || null,
      brand_id: brand_id || null,
      is_active: is_active !== undefined ? is_active === 'true' || is_active === true : true,
      is_featured: is_featured === 'true' || is_featured === true,
    });

    const created = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Brand, as: 'brand', attributes: ['id', 'name', 'slug', 'logo'] },
      ],
    });

    return successResponse(res, formatProduct(created), 'Produk berhasil dibuat', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /products/:id – perbarui produk (admin)
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return notFoundResponse(res, 'Produk tidak ditemukan');

    const {
      name, description, sku, price, promo_price,
      stock, unit, weight,
      shipping_info, shipping_days, free_shipping,
      category_id, brand_id,
      is_active, is_featured,
      remove_images,
    } = req.body;

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
      let slug = createSlug(name);
      const existingSlug = await Product.findOne({
        where: { slug, id: { [Op.ne]: product.id } },
      });
      updateData.slug = existingSlug ? `${slug}-${Date.now()}` : slug;
    }
    if (description !== undefined) updateData.description = description;
    if (sku !== undefined) updateData.sku = sku;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (promo_price !== undefined) {
      updateData.promo_price = promo_price ? parseFloat(promo_price) : null;
    }
    if (stock !== undefined) updateData.stock = parseInt(stock, 10);
    if (unit !== undefined) updateData.unit = unit;
    if (weight !== undefined) updateData.weight = parseFloat(weight);
    if (shipping_info !== undefined) updateData.shipping_info = shipping_info;
    if (shipping_days !== undefined) updateData.shipping_days = parseInt(shipping_days, 10);
    if (free_shipping !== undefined) {
      updateData.free_shipping = free_shipping === 'true' || free_shipping === true;
    }
    if (category_id !== undefined) updateData.category_id = category_id || null;
    if (brand_id !== undefined) updateData.brand_id = brand_id || null;
    if (is_active !== undefined) {
      updateData.is_active = is_active === 'true' || is_active === true;
    }
    if (is_featured !== undefined) {
      updateData.is_featured = is_featured === 'true' || is_featured === true;
    }

    // Kelola gambar
    let currentImages = [...(product.images || [])];

    // Hapus gambar tertentu
    if (remove_images) {
      const toRemove = Array.isArray(remove_images) ? remove_images : [remove_images];
      toRemove.forEach((imgPath) => {
        const fullPath = path.join(process.cwd(), imgPath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
      currentImages = currentImages.filter((img) => !toRemove.includes(img));
    }

    // Tambah gambar baru
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => `/uploads/products/${f.filename}`);
      currentImages = [...currentImages, ...newImages];
    }

    updateData.images = currentImages;

    await product.update(updateData);

    const updated = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Brand, as: 'brand', attributes: ['id', 'name', 'slug', 'logo'] },
      ],
    });

    return successResponse(res, formatProduct(updated), 'Produk berhasil diperbarui');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /products/:id – hapus produk (admin)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return notFoundResponse(res, 'Produk tidak ditemukan');

    // Hapus file gambar dari disk
    if (Array.isArray(product.images)) {
      product.images.forEach((imgPath) => {
        const fullPath = path.join(process.cwd(), imgPath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
    }

    await product.destroy();
    return successResponse(res, null, 'Produk berhasil dihapus');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /products/featured – produk unggulan
 */
const getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const products = await Product.findAll({
      where: { is_featured: true, is_active: true },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Brand, as: 'brand', attributes: ['id', 'name', 'slug', 'logo'] },
      ],
      order: [['created_at', 'DESC']],
      limit: Math.min(50, parseInt(limit, 10) || 10),
    });

    return successResponse(res, products.map(formatProduct), 'Produk unggulan berhasil diambil');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /products/promo – produk sedang promo
 */
const getPromoProducts = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { page: p, limit: l, offset } = getPagination(page, limit);

    const { count, rows } = await Product.findAndCountAll({
      where: {
        is_active: true,
        promo_price: { [Op.not]: null, [Op.gt]: 0 },
      },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Brand, as: 'brand', attributes: ['id', 'name', 'slug', 'logo'] },
      ],
      order: [['created_at', 'DESC']],
      limit: l,
      offset,
    });

    return paginatedResponse(
      res,
      rows.map(formatProduct),
      'Produk promo berhasil diambil',
      { total: count, page: p, limit: l }
    );
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /products/:id/stock – perbarui stok (admin)
 */
const updateStock = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return notFoundResponse(res, 'Produk tidak ditemukan');

    const { stock, operation } = req.body;
    const qty = parseInt(stock, 10);

    if (isNaN(qty) || qty < 0) {
      return errorResponse(res, 'Jumlah stok tidak valid', 400);
    }

    let newStock;
    if (operation === 'add') {
      newStock = product.stock + qty;
    } else if (operation === 'subtract') {
      newStock = Math.max(0, product.stock - qty);
    } else {
      newStock = qty;
    }

    await product.update({ stock: newStock });
    return successResponse(
      res,
      { id: product.id, stock: newStock },
      'Stok berhasil diperbarui'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getPromoProducts,
  updateStock,
};
