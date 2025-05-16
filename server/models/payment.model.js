const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./user.model');
const Parking = require('./parking.model');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
  },
  payment_time: {
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
  parking_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Parking,
      key: 'id',
    },
  },
}, {
  tableName: 'payments',
  timestamps: false,
});

Payment.belongsTo(User, { foreignKey: 'user_id' });
Payment.belongsTo(Parking, { foreignKey: 'parking_id' });

module.exports = Payment;
