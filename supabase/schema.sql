-- ============================================
-- ParillaBurgers - Esquema de Base de Datos
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Categorías del menú
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Productos del menú
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  available BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  points INT DEFAULT 0,
  total_orders INT DEFAULT 0,
  total_spent NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) DEFAULT 3000,
  total NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','preparing','on_the_way','delivered','cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed')),
  wompi_transaction_id TEXT,
  notes TEXT,
  points_earned INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Menú y banners: lectura pública
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public read banners" ON banners FOR SELECT USING (active = true);

-- Clientes: insertar/leer propio
CREATE POLICY "Anyone can insert customer" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Read own customer" ON customers FOR SELECT USING (true);
CREATE POLICY "Update own customer" ON customers FOR UPDATE USING (true);

-- Pedidos: insertar y leer propio
CREATE POLICY "Anyone can insert order" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Read own order" ON orders FOR SELECT USING (true);
CREATE POLICY "Admin update order" ON orders FOR UPDATE USING (true);

-- ============================================
-- Función: actualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Datos iniciales: Categorías y menú
-- ============================================
INSERT INTO categories (name, sort_order) VALUES
  ('Hamburguesas', 1),
  ('Otros', 2),
  ('Acompañamientos', 3),
  ('Combos', 4)
ON CONFLICT DO NOTHING;

-- Hamburguesas
WITH cat AS (SELECT id FROM categories WHERE name = 'Hamburguesas' LIMIT 1)
INSERT INTO menu_items (category_id, name, description, price, sort_order) VALUES
  ((SELECT id FROM cat), 'Clásica', 'Carne artesanal · lechuga · tomate · tocineta · queso · salsa de la casa', 9200, 1),
  ((SELECT id FROM cat), 'Argentina', 'Clásica + chimichurri artesanal', 10200, 2),
  ((SELECT id FROM cat), 'Mexicana', 'Clásica + jalapeños', 10200, 3),
  ((SELECT id FROM cat), 'Maicitos', 'Clásica + macitos + salsa especial', 10500, 4),
  ((SELECT id FROM cat), 'Mixta', 'Clásica pollo + clásica res', 12900, 5),
  ((SELECT id FROM cat), 'Champiñones', 'Clásica + champiñones', 11900, 6),
  ((SELECT id FROM cat), 'Doble', '2 Clásica pollo o res', 13500, 7),
  ((SELECT id FROM cat), 'Pollo', 'Clásica pollo', 9200, 8),
  ((SELECT id FROM cat), 'Pollo Champiñones', 'Clásica pollo + champiñones', 11900, 9)
ON CONFLICT DO NOTHING;

-- Otros
WITH cat AS (SELECT id FROM categories WHERE name = 'Otros' LIMIT 1)
INSERT INTO menu_items (category_id, name, description, price, sort_order) VALUES
  ((SELECT id FROM cat), 'Choripan', 'Chorizo argentino + pan + chimichurri artesanal + queso', 12000, 1),
  ((SELECT id FROM cat), 'Perro', 'Salchicha de la casa + queso', 7900, 2),
  ((SELECT id FROM cat), 'Chuzo', 'Pollo + tocineta', 10900, 3)
ON CONFLICT DO NOTHING;

-- Acompañamientos
WITH cat AS (SELECT id FROM categories WHERE name = 'Acompañamientos' LIMIT 1)
INSERT INTO menu_items (category_id, name, description, price, sort_order) VALUES
  ((SELECT id FROM cat), 'Papas', 'Francesas o cascos', 4000, 1),
  ((SELECT id FROM cat), 'Mazorca', 'Crema agria de la casa + queso costeño + sal de chile', 4500, 2)
ON CONFLICT DO NOTHING;

-- Combos
WITH cat AS (SELECT id FROM categories WHERE name = 'Combos' LIMIT 1)
INSERT INTO menu_items (category_id, name, description, price, sort_order) VALUES
  ((SELECT id FROM cat), 'Combo 1', 'Tu hamburguesa + gaseosa o agua + papas', 5000, 1),
  ((SELECT id FROM cat), 'Combo 2', 'Tu hamburguesa + cerveza + papas', 6500, 2),
  ((SELECT id FROM cat), 'Combo 3', 'Tu hamburguesa + soda italiana + papas', 8500, 3)
ON CONFLICT DO NOTHING;

-- Ofertas especiales
CREATE TABLE IF NOT EXISTS specials_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Datos iniciales de ofertas
INSERT INTO specials_offers (title, emoji, description, active, sort_order) VALUES
  ('Combo Hamburguesero', '🍔', 'Hasta -30%', TRUE, 1),
  ('Acompañamientos', '🍟', 'Compra 2, lleva 3', TRUE, 2),
  ('Parrilla a la Brasa', '🔥', 'Jugosas y tiernas', TRUE, 3),
  ('Gana Puntos', '🎯', '100 pts = $1.000', TRUE, 4)
ON CONFLICT DO NOTHING;
