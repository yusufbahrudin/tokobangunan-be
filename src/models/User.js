const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define(
  'User',
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
        notEmpty: { msg: 'Nama tidak boleh kosong' },
        len: { args: [2, 100], msg: 'Nama harus antara 2 hingga 100 karakter' },
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'Format email tidak valid' },
        notEmpty: { msg: 'Email tidak boleh kosong' },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password tidak boleh kosong' },
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.refresh_token;
  return values;
};

module.exports = User;
