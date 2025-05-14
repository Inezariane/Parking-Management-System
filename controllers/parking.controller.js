const { Payment, Parking } = require('../models');

const registerEntry = async (req, res) => {
  const { car_number, slot_number } = req.body;
  const user_id = req.user.id;
  try {
    const unpaidPayments = await Payment.findAll({
      where: { user_id, status: 'pending' },
    });
    if (unpaidPayments.length > 0) {
      return res.status(403).json({ error: 'Unpaid dues detected. Please clear payments.' });
    }

    const parking = await Parking.create({
      user_id,
      car_number,
      slot_number,
      entry_time: new Date(),
    });
    res.status(201).json(parking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to register entry' });
  }
};

const registerExit = async (req, res) => {
  const { parking_id } = req.body;
  try {
    const parking = await Parking.findOne({
      where: { id: parking_id, exit_time: null },
    });
    if (!parking) {
      return res.status(404).json({ error: 'Parking record not found or already exited' });
    }

    const entryTime = parking.entry_time;
    const exitTime = new Date();
    const durationHours = Math.ceil((exitTime - entryTime) / (1000 * 60 * 60));
    const amount = durationHours * 5;

    await parking.update({ exit_time: exitTime });

    await Payment.create({
      user_id: parking.user_id,
      parking_id,
      amount,
      status: 'pending',
    });

    res.json({ ...parking.toJSON(), amount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register exit' });
  }
};

module.exports = { registerEntry, registerExit };