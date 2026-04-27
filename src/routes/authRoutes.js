const express = require('express');
const router = express.Router();

const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateMe,
  changePassword,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { uploadSingleImage } = require('../middleware/upload');
const validate = require('../middleware/validate');
const {
  registerRules,
  loginRules,
  changePasswordRules,
} = require('../validators/authValidator');

// ── Public ────────────────────────────────────────────────────────────────
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/refresh-token', refreshToken);

// ── Protected ─────────────────────────────────────────────────────────────
router.use(authenticate);

router.get('/me', getMe);
router.put('/me', uploadSingleImage('avatar', 'avatars'), updateMe);
router.put('/change-password', changePasswordRules, validate, changePassword);
router.post('/logout', logout);

module.exports = router;
