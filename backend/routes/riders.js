const express = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/riders/profile — get rider profile
router.get('/profile', authMiddleware, requireRole('rider'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name, u.email, u.phone
       FROM rider_profiles r JOIN users u ON u.id = r.user_id
       WHERE r.user_id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.json({ exists: false });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/riders/profile — create/update rider profile
router.post('/profile', authMiddleware, requireRole('rider'), async (req, res) => {
  const { area_covered, ghana_card_number, bicycle_type, emergency_contact } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM rider_profiles WHERE user_id = $1', [req.user.id]);

    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(
        `UPDATE rider_profiles SET
          area_covered = COALESCE($1, area_covered),
          ghana_card_number = COALESCE($2, ghana_card_number),
          bicycle_type = COALESCE($3, bicycle_type),
          emergency_contact = COALESCE($4, emergency_contact),
          updated_at = NOW()
         WHERE user_id = $5 RETURNING *`,
        [area_covered, ghana_card_number, bicycle_type, emergency_contact, req.user.id]
      );
    } else {
      result = await pool.query(
        `INSERT INTO rider_profiles (user_id, area_covered, ghana_card_number, bicycle_type, emergency_contact)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.user.id, area_covered, ghana_card_number, bicycle_type, emergency_contact]
      );
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/riders/earnings — rider earnings summary
router.get('/earnings', authMiddleware, requireRole('rider'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         COUNT(*) AS total_deliveries,
         COUNT(*) FILTER (WHERE DATE(delivered_at) = CURRENT_DATE) AS today_deliveries,
         COUNT(*) FILTER (WHERE delivered_at >= NOW() - INTERVAL '7 days') AS week_deliveries,
         SUM(delivery_fee) AS total_earned,
         SUM(delivery_fee) FILTER (WHERE DATE(delivered_at) = CURRENT_DATE) AS today_earned,
         SUM(delivery_fee) FILTER (WHERE delivered_at >= NOW() - INTERVAL '7 days') AS week_earned
       FROM orders
       WHERE rider_id = $1 AND status = 'delivered'`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/riders/deliveries — rider's delivery history
router.get('/deliveries', authMiddleware, requireRole('rider'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.status, o.delivery_address, o.delivery_fee, o.total,
              o.picked_up_at, o.delivered_at, o.created_at,
              s.name AS shop_name, s.address AS shop_address,
              u.name AS customer_name
       FROM orders o
       JOIN shops s ON s.id = o.shop_id
       JOIN users u ON u.id = o.customer_id
       WHERE o.rider_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
