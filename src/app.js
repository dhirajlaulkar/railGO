const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const pnrRoutes = require('./routes/pnr');
const schedulerService = require('./services/schedulerService');



dotenv.config();
connectDB();

const app = express();

const cors = require('cors');
app.use(cors());

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/pnr', pnrRoutes);

schedulerService.startPNRScheduler();

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 