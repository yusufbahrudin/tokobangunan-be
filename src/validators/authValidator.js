const { body } = require('express-validator');

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama wajib diisi')
    .isLength({ min: 2, max: 100 }).withMessage('Nama harus antara 2 hingga 100 karakter'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password wajib diisi')
    .isLength({ min: 8 }).withMessage('Password minimal 8 karakter')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka'),

  body('phone')
    .optional()
    .trim()
    .isMobilePhone('id-ID').withMessage('Nomor telepon tidak valid'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password wajib diisi'),
];

const changePasswordRules = [
  body('current_password')
    .notEmpty().withMessage('Password lama wajib diisi'),

  body('new_password')
    .notEmpty().withMessage('Password baru wajib diisi')
    .isLength({ min: 8 }).withMessage('Password minimal 8 karakter')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka'),

  body('confirm_password')
    .notEmpty().withMessage('Konfirmasi password wajib diisi')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Konfirmasi password tidak cocok');
      }
      return true;
    }),
];

module.exports = { registerRules, loginRules, changePasswordRules };
