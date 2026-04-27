const slugify = require('slugify');

/**
 * Buat slug dari string
 */
const createSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'id',
  });
};

/**
 * Hitung harga hemat (selisih harga normal - harga promo)
 */
const hitungHemat = (harga, hargaPromo) => {
  if (!hargaPromo || hargaPromo <= 0 || hargaPromo >= harga) return 0;
  return harga - hargaPromo;
};

/**
 * Hitung persentase diskon
 */
const hitungDiskon = (harga, hargaPromo) => {
  if (!hargaPromo || hargaPromo <= 0 || hargaPromo >= harga) return 0;
  return Math.round(((harga - hargaPromo) / harga) * 100 * 100) / 100;
};

/**
 * Format harga ke format Rupiah
 */
const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
};

/**
 * Pagination helper
 */
const getPagination = (page, limit) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (parsedPage - 1) * parsedLimit;
  return { page: parsedPage, limit: parsedLimit, offset };
};

/**
 * Sanitasi nama file upload
 */
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
};

module.exports = {
  createSlug,
  hitungHemat,
  hitungDiskon,
  formatRupiah,
  getPagination,
  sanitizeFilename,
};
