'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      slug: { type: Sequelize.STRING(120), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      image: { type: Sequelize.STRING(255), allowNull: true },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('categories');
  },
};
