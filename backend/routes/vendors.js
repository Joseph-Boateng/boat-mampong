const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/vendors — list all active shops (public)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = `
      SELECT s.id, s.name, s.description, s.category, s.address, s.phone,
             s.is_open, s.image_url, s.created_at,
             COUNT(p.id) AS product_count
      FROM shops s
      LEFT JOIN products p ON p.shop_id = s.id AND p.is_available = true
      WHERE s.is_active = true
    `;
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND s.category = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (s.name ILIKE $${params.length} OR s.description ILIKE $${params.length})`;
    }

    query += ' GROUP BY s.id ORDER BY s.is_open DESC, s.name ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/vendors/:id — single shop with products (public)
router.get('/:id', async (req, res) => {
  try {
    const shop = await pool.query(
      `SELECT s.*, u.name AS owner_name, u.phone AS owner_phone
       FROM shops s JOIN users u ON u.id = s.owner_id
       WHERE s.id = $1 AND s.is_active = true`,
      [req.params.id]
    );
    if (shop.rows.length === 0) return res.status(404).json({ error: 'Shop not found.' });

    const products = await pool.query(
      `SELECT * FROM products WHERE shop_id = $1 AND is_available = true ORDER BY category, name`,
      [req.params.id]
    );

    res.json({ ...shop.rows[0], products: products.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/vendors/my/shop — vendor's own shop
router.get('/my/shop', authMiddleware, requireRole('vendor'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM shops WHERE owner_id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Shop not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/vendors/my/shop — update vendor's shop
router.put('/my/shop', authMiddleware, requireRole('vendor'), async (req, res) => {
  const { name, description, category, address, phone, image_url, is_open } = req.body;
  try {
    const result = await pool.query(
      `UPDATE shops SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        address = COALESCE($4, address),
        phone = COALESCE($5, phone),
        image_url = COALESCE($6, image_url),
        is_open = COALESCE($7, is_open),
        updated_at = NOW()
       WHERE owner_id = $8
       RETURNING *`,
      [name, description, category, address, phone, image_url, is_open, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
