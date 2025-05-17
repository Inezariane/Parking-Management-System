const sequelize = require ('../config/db.config');
const ParkingSlot = require ('../models/parkingSlot.model');
const SlotRequest = require ('../models/slotRequest.model');
const User = require ('../models/user.model');
const Vehicle = require ('../models/vehicle.model');
const Log = require ('../models/log.model');

const syncModels = async () => {
    await sequelize.sync({ force: false });
  };

module.exports = {
  User,
  ParkingSlot,
  SlotRequest,
  Vehicle,
  Log,
  syncModels,
};
