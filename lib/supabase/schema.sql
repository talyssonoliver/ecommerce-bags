-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  inventory_count INTEGER NOT NULL DEFAULT 0,
  category VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Images table
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url VARCHAR NOT NULL,
  alt_text VARCHAR,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  phone VARCHAR,
  address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  status VARCHAR NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_intent_id VARCHAR,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL
);

-- Set up RLS (Row Level Security) policies
-- Products are viewable by everyone
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" 
ON products FOR SELECT USING (true);

-- Products can only be modified by admin users
CREATE POLICY "Products can only be modified by admins" 
ON products FOR INSERT UPDATE DELETE USING (
  auth.uid() IN (SELECT user_id FROM admin_users)
);

-- Product Images are viewable by everyone
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product Images are viewable by everyone" 
ON product_images FOR SELECT USING (true);

-- Product Images can only be modified by admin users
CREATE POLICY "Product Images can only be modified by admins" 
ON product_images FOR INSERT UPDATE DELETE USING (
  auth.uid() IN (SELECT user_id FROM admin_users)
);

-- Customers can only view and modify their own data
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their own data" 
ON customers FOR SELECT USING (
  auth.uid() = id OR auth.uid() IN (SELECT user_id FROM admin_users)
);
CREATE POLICY "Customers can modify their own data" 
ON customers FOR UPDATE USING (
  auth.uid() = id OR auth.uid() IN (SELECT user_id FROM admin_users)
);

-- Orders security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their own orders" 
ON orders FOR SELECT USING (
  auth.uid() = customer_id OR auth.uid() IN (SELECT user_id FROM admin_users)
);
CREATE POLICY "Only admins can modify orders" 
ON orders FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM admin_users)
);

-- Order Items security
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their own order items" 
ON order_items FOR SELECT USING (
  auth.uid() IN (
    SELECT customer_id FROM orders 
    WHERE orders.id = order_items.order_id
  ) 
  OR auth.uid() IN (SELECT user_id FROM admin_users)
);