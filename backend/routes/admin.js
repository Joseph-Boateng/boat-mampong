const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// All admin routes require auth + admin role
router.use(authMiddleware, requireRole('admin'));

// GET /api/admin/stats — platform overview
router.get('/stats', async (req, res) => {
  try {
    const [users, orders, shops, riders] = await Promise.all([
      pool.query(`SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE role = 'customer') AS customers,
        COUNT(*) FILTER (WHERE role = 'vendor') AS vendors,
        COUNT(*) FILTER (WHERE role = 'rider') AS riders,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS new_this_week
        FROM users`),
      pool.query(`SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
        COALESCE(SUM(total) FILTER (WHERE status = 'delivered'), 0) AS total_revenue,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS new_this_week
        FROM orders`),
      pool.query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_open = true) AS open FROM shops`),
      pool.query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_verified = true) AS verified FROM rider_profiles`),
    ]);
    res.json({
      users: users.rows[0],
      orders: orders.rows[0],
      shops: shops.rows[0],
      riders: riders.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/admin/users — all users
router.get('/users', async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = `SELECT id, name, email, phone, role, is_active, created_at FROM users WHERE 1=1`;
    const params = [];
    if (role) { params.push(role); query += ` AND role = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length})`; }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/admin/users/:id — activate or deactivate a user
router.patch('/users/:id', async (req, res) => {
  const { is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role, is_active`,
      [is_active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/admin/shops — all vendor shops
router.get('/shops', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.name AS owner_name, u.email AS owner_email, u.phone AS owner_phone,
              COUNT(p.id) AS product_count,
              COUNT(o.id) AS order_count
       FROM shops s
       JOIN users u ON u.id = s.owner_id
       LEFT JOIN products p ON p.shop_id = s.id
       LEFT JOIN orders o ON o.shop_id = s.id
       GROUP BY s.id, u.name, u.email, u.phone
       ORDER BY s.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/admin/shops/:id — activate or deactivate a shop
router.patch('/shops/:id', async (req, res) => {
  const { is_active, is_open } = req.body;
  try {
    const result = await pool.query(
      `UPDATE shops SET
        is_active = COALESCE($1, is_active),
        is_open = COALESCE($2, is_open),
        updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [is_active, is_open, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/admin/orders — all orders
router.get('/orders', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT o.id, o.status, o.total, o.delivery_fee, o.delivery_address, o.created_at,
             u.name AS customer_name, u.phone AS customer_phone,
             s.name AS shop_name,
             r.name AS rider_name
      FROM orders o
      JOIN users u ON u.id = o.customer_id
      JOIN shops s ON s.id = o.shop_id
      LEFT JOIN users r ON r.id = o.rider_id
      WHERE 1=1`;
    const params = [];
    if (status) { params.push(status); query += ` AND o.status = $${params.length}`; }
    query += ' ORDER BY o.created_at DESC LIMIT 200';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/admin/riders — all riders with earnings
router.get('/riders', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.is_active,
              rp.area_covered, rp.bicycle_type, rp.is_verified,
              COUNT(o.id) AS total_deliveries,
              COALESCE(SUM(o.delivery_fee) FILTER (WHERE o.status = 'delivered'), 0) AS total_earned
       FROM users u
       LEFT JOIN rider_profiles rp ON rp.user_id = u.id
       LEFT JOIN orders o ON o.rider_id = u.id
       WHERE u.role = 'rider'
       GROUP BY u.id, rp.area_covered, rp.bicycle_type, rp.is_verified
       ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/admin/riders/:id/verify — verify a rider
router.patch('/riders/:id/verify', async (req, res) => {
  const { is_verified } = req.body;
  try {
    await pool.query(
      `UPDATE rider_profiles SET is_verified = $1, updated_at = NOW() WHERE user_id = $2`,
      [is_verified, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
