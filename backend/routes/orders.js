const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders — customer places an order
router.post('/', authMiddleware, requireRole('customer'), async (req, res) => {
  const { shop_id, items, delivery_address, delivery_notes } = req.body;
  // items: [{ product_id, quantity }]

  if (!shop_id || !items || items.length === 0 || !delivery_address) {
    return res.status(400).json({ error: 'shop_id, items, and delivery_address are required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch product prices and calculate total
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await client.query(
        'SELECT id, name, price, shop_id FROM products WHERE id = $1 AND is_available = true',
        [item.product_id]
      );
      if (product.rows.length === 0) {
        throw new Error(`Product ${item.product_id} not found or unavailable.`);
      }
      if (product.rows[0].shop_id !== shop_id) {
        throw new Error('All items must be from the same shop.');
      }
      const lineTotal = parseFloat(product.rows[0].price) * item.quantity;
      subtotal += lineTotal;
      orderItems.push({
        product_id: item.product_id,
        name: product.rows[0].name,
        price: product.rows[0].price,
        quantity: item.quantity,
        line_total: lineTotal,
      });
    }

    const delivery_fee = 8.00; // GHS - flat rate (configurable)
    const total = subtotal + delivery_fee;

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders
         (customer_id, shop_id, delivery_address, delivery_notes, subtotal, delivery_fee, total, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [req.user.id, shop_id, delivery_address, delivery_notes, subtotal, delivery_fee, total]
    );
    const order = orderResult.rows[0];

    // Insert order items
    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, price, quantity, line_total)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.product_id, item.name, item.price, item.quantity, item.line_total]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ ...order, items: orderItems });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Order error:', err);
    res.status(400).json({ error: err.message || 'Failed to place order.' });
  } finally {
    client.release();
  }
});

// GET /api/orders — customer's own orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query, params;

    if (req.user.role === 'customer') {
      query = `
        SELECT o.*, s.name AS shop_name, s.image_url AS shop_image
        FROM orders o JOIN shops s ON s.id = o.shop_id
        WHERE o.customer_id = $1 ORDER BY o.created_at DESC`;
      params = [req.user.id];
    } else if (req.user.role === 'vendor') {
      query = `
        SELECT o.*, u.name AS customer_name, u.phone AS customer_phone
        FROM orders o
        JOIN shops s ON s.id = o.shop_id
        JOIN users u ON u.id = o.customer_id
        WHERE s.owner_id = $1 ORDER BY o.created_at DESC`;
      params = [req.user.id];
    } else if (req.user.role === 'rider') {
      query = `
        SELECT o.*, s.name AS shop_name, s.address AS shop_address,
               u.name AS customer_name, u.phone AS customer_phone
        FROM orders o
        JOIN shops s ON s.id = o.shop_id
        JOIN users u ON u.id = o.customer_id
        WHERE o.rider_id = $1 ORDER BY o.created_at DESC`;
      params = [req.user.id];
    } else {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/orders/available — rider sees orders ready for pickup
router.get('/available', authMiddleware, requireRole('rider'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, s.name AS shop_name, s.address AS shop_address,
              u.name AS customer_name, u.phone AS customer_phone
       FROM orders o
       JOIN shops s ON s.id = o.shop_id
       JOIN users u ON u.id = o.customer_id
       WHERE o.status = 'ready' AND o.rider_id IS NULL
       ORDER BY o.created_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/orders/:id — get single order with items
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await pool.query(
      `SELECT o.*, s.name AS shop_name, s.address AS shop_address, s.phone AS shop_phone,
              u.name AS customer_name, u.phone AS customer_phone,
              r.name AS rider_name, r.phone AS rider_phone
       FROM orders o
       JOIN shops s ON s.id = o.shop_id
       JOIN users u ON u.id = o.customer_id
       LEFT JOIN users r ON r.id = o.rider_id
       WHERE o.id = $1`,
      [req.params.id]
    );
    if (order.rows.length === 0) return res.status(404).json({ error: 'Order not found.' });

    const items = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [req.params.id]
    );

    res.json({ ...order.rows[0], items: items.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/orders/:id/status — update order status
// Status flow: pending → confirmed (vendor) → ready (vendor) → picked_up (rider) → delivered (rider)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['confirmed', 'ready', 'picked_up', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  try {
    const order = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (order.rows.length === 0) return res.status(404).json({ error: 'Order not found.' });
    const o = order.rows[0];

    // Authorization checks
    if (['confirmed', 'ready'].includes(status)) {
      const shop = await pool.query('SELECT owner_id FROM shops WHERE id = $1', [o.shop_id]);
      if (shop.rows[0].owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Only the vendor can update this status.' });
      }
    }

    if (['picked_up', 'delivered'].includes(status)) {
      if (o.rider_id !== req.user.id) {
        return res.status(403).json({ error: 'Only the assigned rider can update this status.' });
      }
    }

    const updates = { status };
    if (status === 'picked_up') updates.picked_up_at = new Date();
    if (status === 'delivered') updates.delivered_at = new Date();

    const result = await pool.query(
      `UPDATE orders SET status = $1,
        picked_up_at = COALESCE($2, picked_up_at),
        delivered_at = COALESCE($3, delivered_at),
        updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [status, updates.picked_up_at || null, updates.delivered_at || null, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/orders/:id/accept — rider accepts a delivery
router.patch('/:id/accept', authMiddleware, requireRole('rider'), async (req, res) => {
  try {
    const order = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (order.rows.length === 0) return res.status(404).json({ error: 'Order not found.' });

    if (order.rows[0].status !== 'ready') {
      return res.status(400).json({ error: 'Order is not ready for pickup.' });
    }
    if (order.rows[0].rider_id) {
      return res.status(409).json({ error: 'Order already taken by another rider.' });
    }

    const result = await pool.query(
      `UPDATE orders SET rider_id = $1, status = 'picked_up', picked_up_at = NOW(), updated_at = NOW()
       WHERE id = $2 AND rider_id IS NULL AND status = 'ready'
       RETURNING *`,
      [req.user.id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'Order was just taken by another rider.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
