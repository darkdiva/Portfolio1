require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./models/Message');
const contactRoute = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.FRONTEND_URL === '*'
  ? true : [process.env.FRONTEND_URL];

app.use(cors({ origin: allowedOrigins, methods: ['GET','POST'], allowedHeaders: ['Content-Type'] }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);

app.use('/api/contact', contactRoute);

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Assil Portfolio Backend', version: '1.0.0' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log('✅ Database connected');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`   Contact API → http://localhost:${PORT}/api/contact`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
