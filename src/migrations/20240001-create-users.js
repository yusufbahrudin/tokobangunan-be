'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      password: { type: Sequelize.STRING(255), allowNull: false },
      role: { type: Sequelize.ENUM('admin', 'user'), defaultValue: 'user' },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      address: { type: Sequelize.TEXT, allowNull: true },
      avatar: { type: Sequelize.STRING(255), allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      refresh_token: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
