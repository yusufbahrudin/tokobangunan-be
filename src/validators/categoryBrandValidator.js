const { body } = require('express-validator');

const categoryRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama kategori wajib diisi')
    .isLength({ min: 2, max: 100 }).withMessage('Nama kategori harus antara 2 hingga 100 karakter'),

  body('description')
    .optional()
    .trim(),

  body('parent_id')
    .optional({ nullable: true })
    .isUUID().withMessage('ID kategori induk tidak valid'),

  body('is_active')
    .optional()
    .isBoolean().withMessage('Status aktif harus berupa boolean'),

  body('sort_order')
    .optional()
    .isInt({ min: 0 }).withMessage('Urutan harus berupa angka positif'),
];

const brandRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama brand wajib diisi')
    .isLength({ min: 2, max: 100 }).withMessage('Nama brand harus antara 2 hingga 100 karakter'),

  body('description')
    .optional()
    .trim(),

  body('is_active')
    .optional()
    .isBoolean().withMessage('Status aktif harus berupa boolean'),
];

module.exports = { categoryRules, brandRules };
