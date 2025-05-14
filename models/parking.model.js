const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./user.model');

const Parking = sequelize.define('Parking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  car_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  slot_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  entry_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  exit_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'parking_records',
  timestamps: false,
});

Parking.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Parking;