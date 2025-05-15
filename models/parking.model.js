const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./user.model');

const Parking = sequelize.define('Parking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Plate number
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
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  tableName: 'parking_records',
  timestamps: false,
});

Parking.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Parking;