-- Krishi Karya — Seed Data
-- Run after schema.sql: psql -d krishikarya -f seed.sql

-- ─── FARMERS ──────────────────────────────────────────────
INSERT INTO farmers (id, name, phone, location, state, verified) VALUES
  ('11111111-0001-0001-0001-000000000001', 'Ramesh Kumar',   '+919811001001', 'Kurukshetra',   'Haryana',        TRUE),
  ('11111111-0001-0001-0001-000000000002', 'Sunita Devi',    '+919811001002', 'Amritsar',      'Punjab',         TRUE),
  ('11111111-0001-0001-0001-000000000003', 'Vijay Patil',    '+919811001003', 'Pune',          'Maharashtra',    TRUE),
  ('11111111-0001-0001-0001-000000000004', 'Suresh Naik',    '+919811001004', 'Ratnagiri',     'Maharashtra',    TRUE),
  ('11111111-0001-0001-0001-000000000005', 'Ganesh More',    '+919811001005', 'Nashik',        'Maharashtra',    TRUE),
  ('11111111-0001-0001-0001-000000000006', 'Harpreet Singh', '+919811001006', 'Agra',          'Uttar Pradesh',  TRUE),
  ('11111111-0001-0001-0001-000000000007', 'Meena Reddy',    '+919811001007', 'Guntur',        'Andhra Pradesh', TRUE),
  ('11111111-0001-0001-0001-000000000008', 'Priya Jadhav',   '+919811001008', 'Sangli',        'Maharashtra',    TRUE),
  ('11111111-0001-0001-0001-000000000009', 'Anand Pillai',   '+919811001009', 'Coimbatore',    'Tamil Nadu',     TRUE),
  ('11111111-0001-0001-0001-000000000010', 'Kiran Yadav',    '+919811001010', 'Patna',         'Bihar',          TRUE),
  ('11111111-0001-0001-0001-000000000011', 'Baldev Singh',   '+919811001011', 'Ludhiana',      'Punjab',         TRUE),
  ('11111111-0001-0001-0001-000000000012', 'Lata Sharma',    '+919811001012', 'Jaipur',        'Rajasthan',      TRUE),
  ('11111111-0001-0001-0001-000000000013', 'Ravi Kumar',     '+919811001013', 'Mysore',        'Karnataka',      TRUE),
  ('11111111-0001-0001-0001-000000000014', 'Ahmed Khan',     '+919811001014', 'Solapur',       'Maharashtra',    TRUE)
ON CONFLICT (phone) DO NOTHING;

-- ─── PRODUCE ──────────────────────────────────────────────
INSERT INTO produce (name_en, name_hi, icon, category, farmer_id, location, grade, price, unit, stock_kg) VALUES
  ('Wheat',          'गेहूं',           'wheat',       'grain',     '11111111-0001-0001-0001-000000000001', 'Haryana',        'A', 28.00,  'per_kg',     5000.00),
  ('Carrot',         'गाजर',            'carrot',      'vegetable', '11111111-0001-0001-0001-000000000002', 'Punjab',         'A', 35.00,  'per_kg',     800.00),
  ('Tomato',         'टमाटर',           'tomato',      'vegetable', '11111111-0001-0001-0001-000000000003', 'Maharashtra',    'B', 22.00,  'per_kg',     1200.00),
  ('Alphonso Mango', 'अल्फांसो आम',     'mango',       'fruit',     '11111111-0001-0001-0001-000000000004', 'Ratnagiri',      'A', 280.00, 'per_dozen',  300.00),
  ('Red Onion',      'लाल प्याज़',      'onion',       'vegetable', '11111111-0001-0001-0001-000000000005', 'Nashik',         'A', 18.00,  'per_kg',     3000.00),
  ('Potato',         'आलू',             'potato',      'vegetable', '11111111-0001-0001-0001-000000000006', 'Uttar Pradesh',  'B', 15.00,  'per_kg',     4000.00),
  ('Green Chili',    'हरी मिर्च',       'chili',       'spice',     '11111111-0001-0001-0001-000000000007', 'Andhra Pradesh', 'A', 60.00,  'per_kg',     500.00),
  ('Black Grapes',   'काले अंगूर',      'grapes',      'fruit',     '11111111-0001-0001-0001-000000000008', 'Sangli',         'A', 90.00,  'per_kg',     600.00),
  ('Banana',         'केला',            'banana',      'fruit',     '11111111-0001-0001-0001-000000000009', 'Tamil Nadu',     'B', 40.00,  'per_dozen',  1000.00),
  ('Cauliflower',    'फूलगोभी',         'cauliflower', 'vegetable', '11111111-0001-0001-0001-000000000010', 'Bihar',          'A', 30.00,  'per_kg',     700.00),
  ('Basmati Rice',   'बासमती चावल',     'wheat',       'grain',     '11111111-0001-0001-0001-000000000011', 'Punjab',         'A', 85.00,  'per_kg',     3000.00),
  ('Spinach',        'पालक',            'leaf',        'vegetable', '11111111-0001-0001-0001-000000000012', 'Rajasthan',      'A', 25.00,  'per_kg',     400.00),
  ('Turmeric',       'हल्दी',           'chili',       'spice',     '11111111-0001-0001-0001-000000000013', 'Karnataka',      'A', 120.00, 'per_kg',     800.00),
  ('Pomegranate',    'अनार',            'grapes',      'fruit',     '11111111-0001-0001-0001-000000000014', 'Solapur',        'B', 110.00, 'per_kg',     500.00);

-- ─── ADMIN USER ───────────────────────────────────────────
-- Password hash below is for "Admin@1234" (bcrypt, cost=12)
-- Generate a fresh hash with: python -c "from passlib.hash import bcrypt; print(bcrypt.hash('Admin@1234'))"
INSERT INTO users (email, hashed_password, full_name, role) VALUES
  ('admin@krishikarya.in',
   '$2b$12$placeholder_replace_with_real_bcrypt_hash_of_Admin@1234',
   'Krishi Karya Admin',
   'admin')
ON CONFLICT (email) DO NOTHING;
