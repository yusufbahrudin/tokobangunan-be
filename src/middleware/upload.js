const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { sanitizeFilename } = require('../utils/helpers');

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024; // 5 MB

/**
 * Buat storage engine untuk multer
 */
const buildStorage = (subFolder) => {
  const uploadDir = path.join(process.cwd(), process.env.UPLOAD_PATH || 'uploads', subFolder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeName = `${uuidv4()}${ext}`;
      cb(null, safeName);
    },
  });
};

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPEG, PNG, WebP) yang diizinkan'), false);
  }
};

// Upload gambar produk (maks 5 file)
const uploadProductImages = multer({
  storage: buildStorage('products'),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).array('images', 5);

// Upload satu gambar (avatar, logo, kategori)
const uploadSingleImage = (field, subFolder = 'misc') =>
  multer({
    storage: buildStorage(subFolder),
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  }).single(field);

module.exports = { uploadProductImages, uploadSingleImage };
