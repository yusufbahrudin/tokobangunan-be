require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const logger = require('./src/config/logger');
const { sequelize } = require('./src/models');
const routes = require('./src/routes');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Buat folder uploads & logs jika belum ada ─────────────────────────────
const uploadDirs = ['uploads', 'uploads/products', 'uploads/categories', 'uploads/brands', 'uploads/avatars', 'logs'];
uploadDirs.forEach((dir) => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// ── Security headers ──────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// ── Rate limiting ─────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan, coba lagi nanti',
  },
});
app.use(limiter);

// Rate limit ketat khusus endpoint auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Terlalu banyak percobaan login, coba lagi dalam 15 menit' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Body parser & compression ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ── HTTP logger ───────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );
}

// ── Static files (uploads) ────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── Root ──────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: `Selamat datang di ${process.env.APP_NAME || 'Galangan Rizal API'}`,
    docs: '/api/health',
    version: '1.0.0',
  });
});

// ── Error handlers ────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Database sync & start server ──────────────────────────────────────────
const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Koneksi database berhasil');

    // Sync model ke database (alter aman untuk development)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('Model tersinkronisasi dengan database');

    app.listen(PORT, () => {
      logger.info(`Server berjalan di port ${PORT} (${process.env.NODE_ENV})`);
    });
  } catch (err) {
    logger.error('Gagal menghubungkan ke database:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
