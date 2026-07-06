-- ============================================================
-- Add 'assigned' as a distinct order status (rider accepted the
-- job but hasn't physically picked up the package yet).
-- Run this ONCE in your Supabase SQL Editor
-- ============================================================

DO $$
DECLARE con_name text;
BEGIN
  SELECT c.conname INTO con_name
  FROM pg_constraint c
  JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
  WHERE c.conrelid = 'orders'::regclass AND c.contype = 'c' AND a.attname = 'status';
  IF con_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE orders DROP CONSTRAINT %I', con_name);
  END IF;
END $$;

ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'confirmed', 'ready', 'assigned', 'picked_up', 'delivered', 'cancelled'));

-- Verify:
SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
WHERE conrelid = 'orders'::regclass AND contype = 'c';
