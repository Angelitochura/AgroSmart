const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');

const authRoutes = require('./routes/authRoutes');
const cropRoutes = require('./routes/cropRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const orderRoutes = require('./routes/orderRoutes');
const parcelRoutes = require('./routes/parcelRoutes');
const taskRoutes = require('./routes/taskRoutes');
const supplyRoutes = require('./routes/supplyRoutes');
const marketRoutes = require('./routes/marketRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/apidocs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/supplies', supplyRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API AgroSmart lista' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});