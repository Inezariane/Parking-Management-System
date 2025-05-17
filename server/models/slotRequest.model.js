const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./user.model');
const Vehicle = require('./vehicle.model');
const ParkingSlot = require('./parkingSlot.model');

const SlotRequest = sequelize.define('SlotRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  request_status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  }, 
}, {
  tableName: 'slot_requests',
  timestamps: true,
});

SlotRequest.belongsTo(User, { foreignKey: 'user_id' });
SlotRequest.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });
SlotRequest.belongsTo(ParkingSlot, { foreignKey: 'slot_id', allowNull: true }); // WHat does this line mean ?

module.exports = SlotRequest;