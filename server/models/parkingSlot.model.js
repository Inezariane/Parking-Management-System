const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const ParkingSlot = sequelize.define('ParkingSlot', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  slot_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  size: {
    type: DataTypes.ENUM('small', 'medium', 'large'),
    allowNull: false,
  },
  vehicle_type: {
    type: DataTypes.ENUM('car', 'motorcycle', 'truck'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('available', 'unavailable'),
    defaultValue: 'available',
  },
  location: {
    type: DataTypes.ENUM('north', 'west', 'east', 'south'),
    allowNull: false,
  },
}, {
  tableName: 'parking_slots',
  timestamps: true,
});

module.exports = ParkingSlot;