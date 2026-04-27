const express = require('express');
const router = express.Router();

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { authenticate, adminOnly } = require('../middleware/auth');
const { uploadSingleImage } = require('../middleware/upload');
const validate = require('../middleware/validate');
const { categoryRules } = require('../validators/categoryBrandValidator');

// ── Public ────────────────────────────────────────────────────────────────
router.get('/', getCategories);
router.get('/:id', getCategory);

// ── Admin only ────────────────────────────────────────────────────────────
router.use(authenticate, adminOnly);

router.post(
  '/',
  uploadSingleImage('image', 'categories'),
  categoryRules,
  validate,
  createCategory
);

router.put(
  '/:id',
  uploadSingleImage('image', 'categories'),
  categoryRules.map((r) => r.optional()),
  validate,
  updateCategory
);

router.delete('/:id', deleteCategory);

module.exports = router;
