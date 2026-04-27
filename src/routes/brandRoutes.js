const express = require('express');
const router = express.Router();

const {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} = require('../controllers/brandController');
const { authenticate, adminOnly } = require('../middleware/auth');
const { uploadSingleImage } = require('../middleware/upload');
const validate = require('../middleware/validate');
const { brandRules } = require('../validators/categoryBrandValidator');

// ── Public ────────────────────────────────────────────────────────────────
router.get('/', getBrands);
router.get('/:id', getBrand);

// ── Admin only ────────────────────────────────────────────────────────────
router.use(authenticate, adminOnly);

router.post(
  '/',
  uploadSingleImage('logo', 'brands'),
  brandRules,
  validate,
  createBrand
);

router.put(
  '/:id',
  uploadSingleImage('logo', 'brands'),
  brandRules.map((r) => r.optional()),
  validate,
  updateBrand
);

router.delete('/:id', deleteBrand);

module.exports = router;
