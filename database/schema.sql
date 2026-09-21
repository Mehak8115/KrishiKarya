-- Krishi Karya — PostgreSQL Schema
-- Run: psql -d krishikarya -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUMS ────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('farmer', 'retailer', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE produce_category AS ENUM ('vegetable', 'fruit', 'grain', 'spice', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE produce_grade AS ENUM ('A', 'B', 'C');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE produce_unit AS ENUM ('per_kg', 'per_qtl', 'per_dozen');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── USERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email            VARCHAR(255) NOT NULL UNIQUE,
    hashed_password  VARCHAR(255) NOT NULL,
    full_name        VARCHAR(255) NOT NULL,
    role             user_role    NOT NULL DEFAULT 'retailer',
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ─── FARMERS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS farmers (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       VARCHAR(255) NOT NULL,
    phone      VARCHAR(20)  NOT NULL UNIQUE,
    location   VARCHAR(255) NOT NULL,
    state      VARCHAR(100) NOT NULL,
    verified   BOOLEAN      NOT NULL DEFAULT FALSE,
    joined_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── PRODUCE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS produce (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en    VARCHAR(255)      NOT NULL,
    name_hi    VARCHAR(255),
    icon       VARCHAR(50)       NOT NULL DEFAULT 'leaf',
    category   produce_category  NOT NULL,
    farmer_id  UUID REFERENCES farmers(id) ON DELETE SET NULL,
    location   VARCHAR(255)      NOT NULL,
    grade      produce_grade     NOT NULL DEFAULT 'B',
    price      NUMERIC(10,2)     NOT NULL,
    unit       produce_unit      NOT NULL DEFAULT 'per_kg',
    stock_kg   NUMERIC(12,2)     NOT NULL DEFAULT 0,
    listed_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    is_active  BOOLEAN           NOT NULL DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_produce_category  ON produce(category);
CREATE INDEX IF NOT EXISTS idx_produce_location  ON produce(location);
CREATE INDEX IF NOT EXISTS idx_produce_grade     ON produce(grade);
CREATE INDEX IF NOT EXISTS idx_produce_is_active ON produce(is_active);

-- ─── ORDERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    status           order_status  NOT NULL DEFAULT 'pending',
    total_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
    delivery_address VARCHAR(500),
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);

-- ─── ORDER ITEMS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id   UUID REFERENCES orders(id)  ON DELETE CASCADE  NOT NULL,
    produce_id UUID REFERENCES produce(id) ON DELETE SET NULL,
    quantity   NUMERIC(12,2) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ─── CONTACT MESSAGES ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    message     TEXT         NOT NULL,
    received_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── AI QUALITY GRADES ────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_quality_grades (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produce_id    UUID REFERENCES produce(id) ON DELETE SET NULL,
    user_id       UUID REFERENCES users(id)   ON DELETE SET NULL,
    tool          VARCHAR(20)   NOT NULL,          -- disease | ripeness | quality
    grade_result  VARCHAR(10),                     -- A / B / C  (quality tool only)
    badge         VARCHAR(10),                     -- good | warn | bad
    confidence    INTEGER,
    detail        JSONB,
    recommendation TEXT,
    analyzed_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quality_grades_produce ON ai_quality_grades(produce_id);
CREATE INDEX IF NOT EXISTS idx_quality_grades_user    ON ai_quality_grades(user_id);

-- ─── DEMAND FORECASTS (cached) ────────────────────────────
CREATE TABLE IF NOT EXISTS demand_forecasts (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produce     VARCHAR(100) NOT NULL,
    forecast_data JSONB NOT NULL,
    generated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_produce ON demand_forecasts(produce);

-- ─── NOTIFICATIONS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title      VARCHAR(255) NOT NULL,
    message    TEXT NOT NULL,
    type       VARCHAR(50)  NOT NULL DEFAULT 'info',
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    related_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
