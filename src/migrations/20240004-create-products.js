'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING(255), allowNull: false },
      slug: { type: Sequelize.STRING(280), allowNull: false, unique: true },
      sku: { type: Sequelize.STRING(80), allowNull: true, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      price: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      promo_price: { type: Sequelize.DECIMAL(15, 2), allowNull: true, defaultValue: null },
      stock: { type: Sequelize.INTEGER, defaultValue: 0 },
      unit: { type: Sequelize.STRING(30), defaultValue: 'pcs' },
      weight: { type: Sequelize.DECIMAL(8, 2), allowNull: true, defaultValue: 0 },
      rating: { type: Sequelize.DECIMAL(3, 2), defaultValue: 0 },
      rating_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      images: { type: Sequelize.JSON, defaultValue: [] },
      shipping_info: { type: Sequelize.STRING(255), allowNull: true },
      shipping_days: { type: Sequelize.TINYINT, allowNull: true, defaultValue: 3 },
      free_shipping: { type: Sequelize.BOOLEAN, defaultValue: false },
      sold_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      category_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      brand_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'brands', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_featured: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    // Index untuk pencarian & filter
    await queryInterface.addIndex('products', ['slug']);
    await queryInterface.addIndex('products', ['category_id']);
    await queryInterface.addIndex('products', ['brand_id']);
    await queryInterface.addIndex('products', ['price']);
    await queryInterface.addIndex('products', ['is_active']);
    await queryInterface.addIndex('products', ['is_featured']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('products');
  },
};
