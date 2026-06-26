const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/products?shop_id=xxx — list products for a shop (public)
router.get('/', async (req, res) => {
  try {
    const { shop_id, category } = req.query;
    let query = 'SELECT * FROM products WHERE is_available = true';
    const params = [];

    if (shop_id) {
      params.push(shop_id);
      query += ` AND shop_id = $${params.length}`;
    }
    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    query += ' ORDER BY category, name';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/products — vendor adds a product
router.post('/', authMiddleware, requireRole('vendor'), async (req, res) => {
  const { name, description, price, category, image_url } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Name and price are required.' });

  try {
    const shop = await pool.query('SELECT id FROM shops WHERE owner_id = $1', [req.user.id]);
    if (shop.rows.length === 0) return res.status(404).json({ error: 'Shop not found.' });

    const result = await pool.query(
      `INSERT INTO products (shop_id, name, description, price, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [shop.rows[0].id, name, description, price, category, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/products/:id — vendor updates a product
router.put('/:id', authMiddleware, requireRole('vendor'), async (req, res) => {
  const { name, description, price, category, image_url, is_available } = req.body;
  try {
    // Verify product belongs to this vendor's shop
    const check = await pool.query(
      `SELECT p.id FROM products p
       JOIN shops s ON s.id = p.shop_id
       WHERE p.id = $1 AND s.owner_id = $2`,
      [req.params.id, req.user.id]
    );
    if (check.rows.length === 0) return res.status(403).json({ error: 'Not your product.' });

    const result = await pool.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        category = COALESCE($4, category),
        image_url = COALESCE($5, image_url),
        is_available = COALESCE($6, is_available),
        updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [name, description, price, category, image_url, is_available, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/products/:id — vendor removes a product
router.delete('/:id', authMiddleware, requireRole('vendor'), async (req, res) => {
  try {
    const check = await pool.query(
      `SELECT p.id FROM products p
       JOIN shops s ON s.id = p.shop_id
       WHERE p.id = $1 AND s.owner_id = $2`,
      [req.params.id, req.user.id]
    );
    if (check.rows.length === 0) return res.status(403).json({ error: 'Not your product.' });

    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
