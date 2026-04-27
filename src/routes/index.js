const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const brandRoutes = require('./brandRoutes');
const userRoutes = require('./userRoutes');

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Galangan Rizal API berjalan normal',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/admin/users', userRoutes);

module.exports = router;
