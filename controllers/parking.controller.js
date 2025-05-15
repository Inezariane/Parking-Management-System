const { Parking, Payment, User } = require('../models');

const registerEntry = async (req, res) => {
  const { car_number } = req.body;
  try {
    const user = await User.findOne({ where: { plate_number: car_number } });
    if (!user) {
      return res.status(400).json({ error: 'No user associated with this car number' });
    }

    const unpaidPayments = await Payment.findAll({
      where: { user_id: user.id, status: 'pending' },
    });
    if (unpaidPayments.length > 0) {
      return res.status(403).json({ error: 'Unpaid dues detected. Please clear payments.' });
    }

    // Define total number of parking slots (e.g., 100)
    const TOTAL_SLOTS = 100;
    // Get all occupied slots
    const occupiedSlots = await Parking.findAll({
      where: { exit_time: null },
      attributes: ['slot_number'],
    });
    const occupiedSlotNumbers = occupiedSlots.map((p) => p.slot_number);

    // Generate list of available slots
    const availableSlots = Array.from({ length: TOTAL_SLOTS }, (_, i) => i + 1).filter(
      (slot) => !occupiedSlotNumbers.includes(slot)
    );

    if (availableSlots.length === 0) {
      return res.status(400).json({ error: 'No available parking slots' });
    }

    // Randomly select an available slot
    const slot_number = availableSlots[Math.floor(Math.random() * availableSlots.length)];

    const parking = await Parking.create({
      user_id: user.id,
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
  const { car_number } = req.body;
  try {
    const parking = await Parking.findOne({
      where: { car_number, exit_time: null },
    });
    if (!parking) {
      return res.status(404).json({ error: 'Active parking record not found for this car number' });
    }

    const entryTime = parking.entry_time;
    const exitTime = new Date();
    const durationHours = Math.ceil((exitTime - entryTime) / (1000 * 60 * 60));
    const amount = durationHours * 100; // 100 RWF per hour

    await parking.update({ exit_time: exitTime });

    await Payment.create({
      user_id: parking.user_id,
      parking_id: parking.id,
      amount,
      status: 'pending',
    });

    res.json({ ...parking.toJSON(), amount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register exit' });
  }
};

const viewCurrentParkedUsers = async (req, res) => {
  try {
    const parkedUsers = await Parking.findAll({
      where: { exit_time: null },
      include: [
        {
          model: User,
          attributes: ['username', 'plate_number'],
        },
      ],
    });
    res.json(parkedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current parked users' });
  }
};

module.exports = { registerEntry, registerExit, viewCurrentParkedUsers };
