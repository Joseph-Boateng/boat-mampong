const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
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

// PATCH /api/admin/users/:id — update user fields (is_active, name, email, phone, role)
router.patch('/users/:id', async (req, res) => {
  const { is_active, name, email, phone, role } = req.body;
  const validRoles = ['customer', 'vendor', 'rider', 'admin'];
  if (role && !validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role.' });
  try {
    const result = await pool.query(
      `UPDATE users SET
        is_active = COALESCE($1, is_active),
        name      = COALESCE($2, name),
        email     = COALESCE($3, email),
        phone     = COALESCE($4, phone),
        role      = COALESCE($5, role),
        updated_at = NOW()
       WHERE id = $6
       RETURNING id, name, email, phone, role, is_active`,
      [
        is_active !== undefined ? is_active : null,
        name || null,
        email || null,
        phone || null,
        role || null,
        req.params.id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already in use.' });
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

// PATCH /api/admin/shops/:id — update shop fields
router.patch('/shops/:id', async (req, res) => {
  const { is_active, is_open, name, description, category, address, phone } = req.body;
  try {
    const result = await pool.query(
      `UPDATE shops SET
        is_active   = COALESCE($1, is_active),
        is_open     = COALESCE($2, is_open),
        name        = COALESCE($3, name),
        description = COALESCE($4, description),
        category    = COALESCE($5, category),
        address     = COALESCE($6, address),
        phone       = COALESCE($7, phone),
        updated_at  = NOW()
       WHERE id = $8 RETURNING *`,
      [
        is_active !== undefined ? is_active : null,
        is_open   !== undefined ? is_open   : null,
        name        || null,
        description || null,
        category    || null,
        address     || null,
        phone       || null,
        req.params.id,
      ]
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

// POST /api/admin/users — create a user with any role
router.post('/users', async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required.' });
  }
  const validRoles = ['customer', 'vendor', 'rider', 'admin'];
  if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role.' });
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (id, name, email, phone, password_hash, role)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, name, email, phone, role, is_active, created_at`,
      [uuidv4(), name, email, phone || null, password_hash, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already in use.' });
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/admin/users/:id — delete user and all associated data
router.delete('/users/:id', async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const id = req.params.id;
    await client.query(`UPDATE orders SET rider_id = NULL WHERE rider_id = $1`, [id]);
    await client.query(`DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id = $1)`, [id]);
    await client.query(`DELETE FROM orders WHERE customer_id = $1`, [id]);
    await client.query(`DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE shop_id IN (SELECT id FROM shops WHERE owner_id = $1))`, [id]);
    await client.query(`DELETE FROM orders WHERE shop_id IN (SELECT id FROM shops WHERE owner_id = $1)`, [id]);
    await client.query(`DELETE FROM products WHERE shop_id IN (SELECT id FROM shops WHERE owner_id = $1)`, [id]);
    await client.query(`DELETE FROM shops WHERE owner_id = $1`, [id]);
    await client.query(`DELETE FROM rider_profiles WHERE user_id = $1`, [id]);
    await client.query(`DELETE FROM users WHERE id = $1`, [id]);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  } finally {
    client.release();
  }
});

// DELETE /api/admin/shops/:id — delete shop and all its data
router.delete('/shops/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    await client.query(`DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE shop_id = $1)`, [id]);
    await client.query(`DELETE FROM orders WHERE shop_id = $1`, [id]);
    await client.query(`DELETE FROM products WHERE shop_id = $1`, [id]);
    await client.query(`DELETE FROM shops WHERE id = $1`, [id]);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error.' });
  } finally {
    client.release();
  }
});

// GET /api/admin/products — all products across all shops
router.get('/products', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.name, p.description, p.price, p.category, p.is_available, p.created_at,
              s.id AS shop_id, s.name AS shop_name
       FROM products p
       JOIN shops s ON s.id = p.shop_id
       ORDER BY s.name, p.category, p.name`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/admin/products/:id — toggle availability
router.patch('/products/:id', async (req, res) => {
  const { is_available } = req.body;
  try {
    const result = await pool.query(
      `UPDATE products SET is_available = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [is_available, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/admin/products/:id — remove a product
router.delete('/products/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM order_items WHERE product_id = $1`, [req.params.id]);
    await pool.query(`DELETE FROM products WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/admin/orders/:id — delete an order
router.delete('/orders/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM order_items WHERE order_id = $1`, [req.params.id]);
    await pool.query(`DELETE FROM orders WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/admin/orders/:id/status — manually update order status
router.patch('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'ready', 'assigned', 'picked_up', 'delivered', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
  try {
    await pool.query(`UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`, [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
