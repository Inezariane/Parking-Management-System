const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendSlotApprovalEmail = async (user, slot, vehicle) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: user.email,
    subject: 'Parking Slot Approval',
    text: `Your parking slot request has been approved!\nSlot Number: ${slot.slot_number}\nVehicle: ${vehicle.plate_number}\nApproved At: ${new Date().toISOString()}`,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendSlotApprovalEmail };