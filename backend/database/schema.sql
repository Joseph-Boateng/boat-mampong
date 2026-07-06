-- QuickRun GH — Database Schema
-- Run this in Supabase SQL Editor to set up your database

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (customers, vendors, riders all in one table)
-- ============================================================
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone       VARCHAR(20) NOT NULL,
  role        VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'vendor', 'rider', 'admin')),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SHOPS (each vendor has one shop)
-- ============================================================
CREATE TABLE shops (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  category    VARCHAR(50) DEFAULT 'general'
              CHECK (category IN ('food', 'groceries', 'pharmacy', 'fashion', 'electronics', 'general', 'parcel')),
  address     TEXT,
  phone       VARCHAR(20),
  image_url   TEXT,
  is_open     BOOLEAN DEFAULT true,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id      UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name         VARCHAR(150) NOT NULL,
  description  TEXT,
  price        NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  category     VARCHAR(100),
  image_url    TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id      UUID NOT NULL REFERENCES users(id),
  shop_id          UUID NOT NULL REFERENCES shops(id),
  rider_id         UUID REFERENCES users(id),
  status           VARCHAR(30) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'confirmed', 'ready', 'picked_up', 'delivered', 'cancelled')),
  delivery_address TEXT NOT NULL,
  delivery_notes   TEXT,
  subtotal         NUMERIC(10, 2) NOT NULL,
  delivery_fee     NUMERIC(10, 2) NOT NULL DEFAULT 8.00,
  total            NUMERIC(10, 2) NOT NULL,
  payment_status   VARCHAR(20) DEFAULT 'pending'
                   CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_method   VARCHAR(20) NOT NULL DEFAULT 'cash'
                   CHECK (payment_method IN ('cash', 'online')),
  payment_ref      VARCHAR(100),
  picked_up_at     TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id),
  name        VARCHAR(150) NOT NULL,   -- snapshot at time of order
  price       NUMERIC(10, 2) NOT NULL, -- snapshot at time of order
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  line_total  NUMERIC(10, 2) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RIDER PROFILES (extra info for riders)
-- ============================================================
CREATE TABLE rider_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  area_covered      TEXT,
  ghana_card_number VARCHAR(30),
  bicycle_type      VARCHAR(50),
  emergency_contact VARCHAR(100),
  is_verified       BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_shops_owner ON shops(owner_id);
CREATE INDEX idx_products_shop ON products(shop_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_shop ON orders(shop_id);
CREATE INDEX idx_orders_rider ON orders(rider_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================================
-- SEED: Create a default admin user (change password after setup!)
-- ============================================================
-- INSERT INTO users (name, email, password_hash, phone, role)
-- VALUES ('Admin', 'admin@quickrungh.com', '<bcrypt_hash>', '0200000000', 'admin');
