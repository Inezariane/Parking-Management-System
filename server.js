const express = require('express');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');
const sequelize = require('./config/db.config');
const { syncModels } = require('./models');
const authRoutes = require('./routes/auth.routes');
const parkingRoutes = require('./routes/parking.routes');
const paymentRoutes = require('./routes/payment.routes');

dotenv.config();
const app = express();

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/payments', paymentRoutes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await syncModels();
    console.log('Models synchronized');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

startServer();
