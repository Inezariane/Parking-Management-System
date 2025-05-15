const sequelize = require('../config/db.config');
const User = require('./user.model');
const Parking = require('./parking.model');
const Payment = require('./payment.model');

const syncModels = async () => {
  await sequelize.sync({ force: false });
};

module.exports = {
  User,
  Parking,
  Payment,
  syncModels,
};
