require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
// Matches boat-mampong.vercel.app plus every Vercel-generated alias for this
// project (per-branch previews, per-deployment URLs), not just one hardcoded URL.
const VERCEL_ORIGIN_PATTERN = /^https:\/\/boat-mampong(-[a-z0-9-]+)?\.vercel\.app$/;
const staticAllowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173'].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || staticAllowedOrigins.includes(origin) || VERCEL_ORIGIN_PATTERN.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
// Paystack webhook needs the raw request body to verify its signature,
// so it must be mounted before the global express.json() parser.
const { router: paymentsRouter, paystackWebhook } = require('./routes/payments');
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paystackWebhook);

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/riders', require('./routes/riders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', paymentsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'BOAT Mampong API', version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`BOAT Mampong API running on port ${PORT}`);
});
