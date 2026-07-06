const express = require('express');
const crypto = require('crypto');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
const PAYSTACK_BASE = 'https://api.paystack.co';

// POST /api/payments/initialize — customer starts online payment for an order they just placed
router.post('/initialize', authMiddleware, requireRole('customer'), async (req, res) => {
  const { order_id } = req.body;
  if (!order_id) {
    return res.status(400).json({ error: 'order_id is required.' });
  }

  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [order_id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    const order = orderResult.rows[0];

    if (order.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'This order does not belong to you.' });
    }
    if (order.payment_method !== 'online') {
      return res.status(400).json({ error: 'This order was not placed for online payment.' });
    }

    const reference = `boat_${order.id}_${Date.now()}`;
    const amount = Math.round(parseFloat(order.total) * 100); // pesewas

    const paystackRes = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: req.user.email,
        amount,
        reference,
        callback_url: `${process.env.FRONTEND_URL}/shop/orders/${order.id}/payment-callback`,
        metadata: { order_id: order.id },
      }),
    });

    const paystackData = await paystackRes.json();
    if (!paystackRes.ok || !paystackData.status) {
      console.error('Paystack initialize error:', paystackData);
      return res.status(502).json({ error: 'Failed to start payment. Please try again.' });
    }

    await pool.query('UPDATE orders SET payment_ref = $1, updated_at = NOW() WHERE id = $2', [reference, order.id]);

    res.json({ authorization_url: paystackData.data.authorization_url, reference });
  } catch (err) {
    console.error('Payment initialize error:', err);
    res.status(500).json({ error: 'Server error initializing payment.' });
  }
});

// GET /api/payments/verify/:reference — confirm a payment (called from the frontend callback page)
router.get('/verify/:reference', authMiddleware, async (req, res) => {
  const { reference } = req.params;

  try {
    const paystackRes = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      console.error('Paystack verify error:', paystackData);
      return res.status(502).json({ error: 'Could not verify payment.' });
    }

    const isSuccess = paystackData.data.status === 'success';

    if (isSuccess) {
      await pool.query(
        `UPDATE orders SET payment_status = 'paid', updated_at = NOW() WHERE payment_ref = $1`,
        [reference]
      );
    }

    const orderResult = await pool.query('SELECT * FROM orders WHERE payment_ref = $1', [reference]);

    res.json({
      success: isSuccess,
      status: paystackData.data.status,
      order: orderResult.rows[0] || null,
    });
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ error: 'Server error verifying payment.' });
  }
});

// Paystack webhook — authoritative server-to-server confirmation.
// Mounted separately in server.js with express.raw() BEFORE express.json(),
// so req.body here is a raw Buffer, not parsed JSON.
const paystackWebhook = async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const expectedSignature = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(req.body)
    .digest('hex');

  if (!signature || signature !== expectedSignature) {
    return res.status(401).send('Invalid signature.');
  }

  let event;
  try {
    event = JSON.parse(req.body.toString('utf8'));
  } catch (err) {
    return res.status(400).send('Invalid payload.');
  }

  res.sendStatus(200); // acknowledge immediately; Paystack retries on non-2xx

  if (event.event === 'charge.success') {
    const reference = event.data.reference;
    try {
      await pool.query(
        `UPDATE orders SET payment_status = 'paid', updated_at = NOW() WHERE payment_ref = $1`,
        [reference]
      );
    } catch (err) {
      console.error('Webhook order update error:', err);
    }
  }
};

module.exports = { router, paystackWebhook };
