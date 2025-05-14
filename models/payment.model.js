const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Parking = require('./Parking');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
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
}, {
  tableName: 'payments',
  timestamps: false,
});

Payment.belongsTo(User, { foreignKey: 'user_id' });
Payment.belongsTo(Parking, { foreignKey: 'parking_id' });

module.exports = Payment;