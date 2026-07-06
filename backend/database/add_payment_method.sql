-- ============================================================
-- Add payment_method to orders (cash on delivery vs online/Paystack)
-- Run this ONCE in your Supabase SQL Editor
-- ============================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) NOT NULL DEFAULT 'cash'
  CHECK (payment_method IN ('cash', 'online'));

-- Verify:
SELECT id, status, payment_method, payment_status, payment_ref FROM orders ORDER BY created_at DESC LIMIT 10;
