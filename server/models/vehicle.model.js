const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./user.model');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  plate_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  vehicle_type: {
    type: DataTypes.ENUM('car', 'motorcycle', 'truck'),
    allowNull: false,
  },
  size: {
    type: DataTypes.ENUM('small', 'medium', 'large'),
    allowNull: false,
  },
  attributes: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'vehicles',
  timestamps: true,
});

Vehicle.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Vehicle;