const { body } = require('express-validator');

const createProductRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama produk wajib diisi')
    .isLength({ min: 3, max: 255 }).withMessage('Nama produk harus antara 3 hingga 255 karakter'),

  body('description')
    .optional()
    .trim(),

  body('price')
    .notEmpty().withMessage('Harga wajib diisi')
    .isFloat({ min: 0 }).withMessage('Harga harus berupa angka positif'),

  body('promo_price')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Harga promo harus berupa angka positif')
    .custom((value, { req }) => {
      if (value !== null && value !== undefined && parseFloat(value) >= parseFloat(req.body.price)) {
        throw new Error('Harga promo harus lebih kecil dari harga normal');
      }
      return true;
    }),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stok harus berupa bilangan bulat positif'),

  body('unit')
    .optional()
    .trim()
    .isLength({ max: 30 }).withMessage('Satuan maksimal 30 karakter'),

  body('weight')
    .optional()
    .isFloat({ min: 0 }).withMessage('Berat harus berupa angka positif'),

  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 }).withMessage('Rating harus antara 0 hingga 5'),

  body('shipping_info')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Info pengiriman maksimal 255 karakter'),

  body('shipping_days')
    .optional()
    .isInt({ min: 0 }).withMessage('Estimasi pengiriman harus berupa angka positif'),

  body('free_shipping')
    .optional()
    .isBoolean().withMessage('Free shipping harus berupa boolean'),

  body('category_id')
    .optional({ nullable: true })
    .isUUID().withMessage('ID kategori tidak valid'),

  body('brand_id')
    .optional({ nullable: true })
    .isUUID().withMessage('ID brand tidak valid'),

  body('is_active')
    .optional()
    .isBoolean().withMessage('Status aktif harus berupa boolean'),

  body('is_featured')
    .optional()
    .isBoolean().withMessage('Status featured harus berupa boolean'),
];

const updateProductRules = createProductRules.map((rule) => rule.optional());

module.exports = { createProductRules, updateProductRules };
