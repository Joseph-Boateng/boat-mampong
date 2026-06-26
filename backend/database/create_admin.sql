-- ============================================================
-- Create Admin Account for BOAT Mampong
-- Run this ONCE in your Supabase SQL Editor
-- ============================================================

-- This inserts an admin user with password: Admin@Boat2024!
-- The hash below is bcrypt of that password (cost 10)
-- CHANGE THE PASSWORD after first login by updating via your app or re-running with a new hash

INSERT INTO users (name, email, password_hash, phone, role, is_active)
VALUES (
  'BOAT Admin',
  'admin@boatmampong.com',
  '$2b$10$jwcUNrYNJEjjfO86T8DCueNEDZ2dlWEeO0nAd3Fjp.ttFFUXVrYCu',
  '0200000000',
  'admin',
  true
)
ON CONFLICT (email) DO NOTHING;

-- Verify it was created:
SELECT id, name, email, role, created_at FROM users WHERE role = 'admin';
