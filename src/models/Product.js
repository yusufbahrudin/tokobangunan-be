const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { hitungHemat, hitungDiskon } = require('../utils/helpers');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Nama produk tidak boleh kosong' },
        len: { args: [3, 255], msg: 'Nama produk harus antara 3 hingga 255 karakter' },
      },
    },
    slug: {
      type: DataTypes.STRING(280),
      allowNull: false,
      unique: true,
    },
    sku: {
      type: DataTypes.STRING(80),
      allowNull: true,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Harga normal
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Harga tidak boleh negatif' },
        isDecimal: { msg: 'Format harga tidak valid' },
      },
    },
    // Harga setelah promo
    promo_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: null,
      validate: {
        min: { args: [0], msg: 'Harga promo tidak boleh negatif' },
        isValidPromoPrice(value) {
          if (value !== null && parseFloat(value) >= parseFloat(this.price)) {
            throw new Error('Harga promo harus lebih kecil dari harga normal');
          }
        },
      },
    },
    // Stok tersedia
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: { args: [0], msg: 'Stok tidak boleh negatif' },
      },
    },
    // Satuan: pcs, dus, roll, lembar, kg, liter, m2, m3, set, dll.
    unit: {
      type: DataTypes.STRING(30),
      defaultValue: 'pcs',
    },
    // Berat produk dalam kg
    weight: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      defaultValue: 0,
    },
    // Rating rata-rata (0 - 5)
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    // Jumlah ulasan
    rating_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Array gambar produk (JSON)
    images: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    // Info pengiriman
    shipping_info: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Contoh: Gratis Ongkir, Pengiriman 2-3 hari kerja',
    },
    // Estimasi hari pengiriman
    shipping_days: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 3,
    },
    // Apakah tersedia pengiriman gratis
    free_shipping: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Jumlah terjual
    sold_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Referensi kategori
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    // Referensi brand
    brand_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'brands',
        key: 'id',
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'products',
    // Field virtual yang dihitung otomatis (tidak disimpan di DB)
    getterMethods: {
      // Nominal harga yang dihemat
      hemat() {
        return hitungHemat(parseFloat(this.price), parseFloat(this.promo_price));
      },
      // Persentase diskon
      discount_percent() {
        return hitungDiskon(parseFloat(this.price), parseFloat(this.promo_price));
      },
      // Harga efektif yang dibayar
      harga_efektif() {
        return this.promo_price && parseFloat(this.promo_price) > 0
          ? parseFloat(this.promo_price)
          : parseFloat(this.price);
      },
      // Gambar utama
      thumbnail() {
        return Array.isArray(this.images) && this.images.length > 0
          ? this.images[0]
          : null;
      },
    },
  }
);

module.exports = Product;
