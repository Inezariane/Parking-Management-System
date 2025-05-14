const { Payment, Parking, User } = require('../models');

const viewPayment = async (req, res) => {
  const user_id = req.user.id;
  try {
    const payments = await Payment.findAll({
      where: { user_id, status: 'pending' },
      include: [
        {
          model: Parking,
          attributes: ['car_number', 'slot_number'],
        },
      ],
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

const makePayment = async (req, res) => {
  const { payment_id } = req.body;
  const user_id = req.user.id;
  try {
    const payment = await Payment.findOne({
      where: { id: payment_id, user_id },
    });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    await payment.update({ status: 'completed', payment_time: new Date() });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Payment failed' });
  }
};

const viewAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        { model: User, attributes: ['username'] },
        { model: Parking, attributes: ['car_number', 'slot_number'] },
      ],
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

module.exports = { viewPayment, makePayment, viewAllPayments };