const express = require('express'); 
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const sequelize = require('./config/db.config');
const { syncModels } = require ('./models/index')
const userRoutes = require('./routes/user.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const slotRoutes = require('./routes/parkingSlot.routes');
const requestRoutes = require('./routes/slotRequest.routes');
const logRoutes = require('./routes/log.routes');
const swaggerDocument = require('./docs/swagger.json')
const cors = require('cors');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/logs', logRoutes);

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
