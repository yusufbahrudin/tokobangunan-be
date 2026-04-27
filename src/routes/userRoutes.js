const express = require('express');
const router = express.Router();

const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserActive,
} = require('../controllers/userController');
const { authenticate, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { body } = require('express-validator');

router.use(authenticate, adminOnly);

// Aturan validasi update user oleh admin
const updateUserRules = [
  body('name').optional().trim()
    .isLength({ min: 2, max: 100 }).withMessage('Nama harus antara 2 hingga 100 karakter'),
  body('email').optional().trim().isEmail().withMessage('Format email tidak valid').normalizeEmail(),
  body('role').optional().isIn(['admin', 'user']).withMessage('Role tidak valid'),
  body('phone').optional().trim().isMobilePhone('id-ID').withMessage('Nomor telepon tidak valid'),
  body('is_active').optional().isBoolean().withMessage('Status aktif harus berupa boolean'),
];

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUserRules, validate, updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/toggle-active', toggleUserActive);

module.exports = router;
