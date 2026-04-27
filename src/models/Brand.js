const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Brand = sequelize.define(
  'Brand',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Nama brand tidak boleh kosong' },
      },
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'brands',
  }
);

module.exports = Brand;
