const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getPromoProducts,
  updateStock,
} = require('../controllers/productController');
const { authenticate, adminOnly, optionalAuth } = require('../middleware/auth');
const { uploadProductImages } = require('../middleware/upload');
const validate = require('../middleware/validate');
const {
  createProductRules,
  updateProductRules,
} = require('../validators/productValidator');

// ── Public ────────────────────────────────────────────────────────────────
// GET /api/products
router.get('/', optionalAuth, getProducts);
// GET /api/products/featured
router.get('/featured', getFeaturedProducts);
// GET /api/products/promo
router.get('/promo', getPromoProducts);
// GET /api/products/:id  (id atau slug)
router.get('/:id', optionalAuth, getProduct);

// ── Admin only ────────────────────────────────────────────────────────────
router.use(authenticate, adminOnly);

// POST /api/products
router.post(
  '/',
  uploadProductImages,
  createProductRules,
  validate,
  createProduct
);

// PUT /api/products/:id
router.put(
  '/:id',
  uploadProductImages,
  updateProductRules,
  validate,
  updateProduct
);

// PATCH /api/products/:id/stock
router.patch('/:id/stock', updateStock);

// DELETE /api/products/:id
router.delete('/:id', deleteProduct);

module.exports = router;
