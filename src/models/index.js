const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Brand = require('./Brand');
const Product = require('./Product');

// ─── Relasi Product ────────────────────────────────────────────────────
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });
Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products' });

module.exports = {
  sequelize,
  User,
  Category,
  Brand,
  Product,
};
