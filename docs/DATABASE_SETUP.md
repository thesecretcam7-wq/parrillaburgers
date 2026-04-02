# Configuración de Base de Datos

## Tabla: specials_offers

Esta tabla almacena las ofertas especiales que se muestran en la página principal.

### SQL para crear la tabla:

```sql
-- Create specials_offers table
CREATE TABLE specials_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for sorting
CREATE INDEX idx_specials_offers_sort ON specials_offers(sort_order);
CREATE INDEX idx_specials_offers_active ON specials_offers(active);

-- Insert default offers
INSERT INTO specials_offers (title, emoji, description, sort_order, active) VALUES
  ('Combo Hamburguesero', '🍔', 'Hasta -30%', 0, true),
  ('Acompañamientos', '🍟', 'Compra 2, lleva 3', 1, true),
  ('Parrilla a la Brasa', '🔥', 'Jugosas y tiernas', 2, true),
  ('Gana Puntos', '🎯', '100 pts = $1.000', 3, true);

-- Enable RLS (Row Level Security)
ALTER TABLE specials_offers ENABLE ROW LEVEL SECURITY;

-- Create policy for public read (anyone can see active offers)
CREATE POLICY "Public can read active offers"
  ON specials_offers
  FOR SELECT
  USING (active = true);

-- Create policy for admin update (authenticated users can update/insert/delete)
CREATE POLICY "Admin can manage offers"
  ON specials_offers
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

### Ejecución:

1. Abre Supabase → Tu Proyecto
2. Ve a SQL Editor
3. Copia y pega el SQL anterior
4. Ejecuta

Las ofertas se mostrarán en la página principal automáticamente.

## Estructura de la página de Admin:

- **Admin → Ofertas Especiales**: `/admin/ofertas`
- Crear nuevas ofertas
- Editar título, emoji, descripción
- Activar/desactivar ofertas
- Eliminar ofertas

