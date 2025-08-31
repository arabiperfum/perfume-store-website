/*
  # إنشاء قاعدة البيانات الأساسية لمتجر العطور

  1. الجداول الجديدة
    - `profiles` - ملفات المستخدمين
      - `id` (uuid, primary key, مرتبط بـ auth.users)
      - `name` (text)
      - `phone` (text)
      - `is_admin` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `categories` - فئات المنتجات
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `products` - المنتجات
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `original_price` (decimal, nullable)
      - `image_url` (text)
      - `category_id` (uuid, foreign key)
      - `rating` (decimal)
      - `reviews_count` (integer)
      - `in_stock` (boolean)
      - `stock_quantity` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `orders` - الطلبات
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `total_amount` (decimal)
      - `status` (text)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)
      - `shipping_address` (text)
      - `city` (text)
      - `postal_code` (text)
      - `payment_method` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `order_items` - عناصر الطلبات
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `price` (decimal)
      - `created_at` (timestamp)
    
    - `favorites` - المفضلة
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - إضافة السياسات المناسبة لكل جدول
    - حماية البيانات الحساسة

  3. البيانات الأولية
    - إضافة فئات المنتجات الأساسية
    - إضافة بعض المنتجات التجريبية
    - إنشاء حساب مدير افتراضي
*/

-- إنشاء جدول الملفات الشخصية
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text NOT NULL,
  phone text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول الفئات
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  original_price decimal(10,2),
  image_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  rating decimal(3,2) DEFAULT 5.0,
  reviews_count integer DEFAULT 0,
  in_stock boolean DEFAULT true,
  stock_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول الطلبات
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address text NOT NULL,
  city text NOT NULL,
  postal_code text,
  payment_method text DEFAULT 'cash' CHECK (payment_method IN ('card', 'cash')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول عناصر الطلبات
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول المفضلة
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- تفعيل RLS على جميع الجداول
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- سياسات الملفات الشخصية
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- سياسات الفئات (قراءة للجميع)
CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- سياسات المنتجات (قراءة للجميع، إدارة للمدراء فقط)
CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- سياسات الطلبات
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- سياسات عناصر الطلبات
CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- سياسات المفضلة
CREATE POLICY "Users can read own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites"
  ON favorites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- إدراج الفئات الأساسية
INSERT INTO categories (name, description) VALUES
  ('عطور نسائية', 'عطور مخصصة للنساء بروائح أنثوية جذابة'),
  ('عطور رجالية', 'عطور مخصصة للرجال بروائح قوية ومميزة'),
  ('عطور مشتركة', 'عطور يمكن استخدامها من قبل الجنسين')
ON CONFLICT (name) DO NOTHING;

-- إدراج المنتجات الأساسية
INSERT INTO products (name, description, price, original_price, image_url, category_id, rating, reviews_count, in_stock, stock_quantity)
SELECT 
  'عطر الورد الطائفي الفاخر',
  'عطر فاخر مستخرج من الورد الطائفي الأصيل، يتميز برائحة عذبة وثابتة تدوم طوال اليوم',
  299.00,
  399.00,
  'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=400',
  c.id,
  4.8,
  124,
  true,
  50
FROM categories c WHERE c.name = 'عطور نسائية'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, category_id, rating, reviews_count, in_stock, stock_quantity)
SELECT 
  'عود كمبودي ملكي',
  'عود كمبودي أصيل من أجود الأنواع، رائحة قوية وثابتة تناسب المناسبات الخاصة',
  599.00,
  'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=400',
  c.id,
  4.9,
  89,
  true,
  25
FROM categories c WHERE c.name = 'عطور رجالية'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, original_price, image_url, category_id, rating, reviews_count, in_stock, stock_quantity)
SELECT 
  'مسك الطهارة الأبيض',
  'مسك طبيعي خالص، رائحة نظيفة ومنعشة مناسبة للاستخدام اليومي',
  149.00,
  199.00,
  'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=400',
  c.id,
  4.7,
  156,
  true,
  75
FROM categories c WHERE c.name = 'عطور مشتركة'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, category_id, rating, reviews_count, in_stock, stock_quantity)
SELECT 
  'عطر الياسمين الدمشقي',
  'عطر مستخرج من زهور الياسمين الدمشقي الأصيل، رائحة رومانسية وجذابة',
  249.00,
  'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=400',
  c.id,
  4.6,
  78,
  false,
  0
FROM categories c WHERE c.name = 'عطور نسائية'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, category_id, rating, reviews_count, in_stock, stock_quantity)
SELECT 
  'عنبر أشقر فاخر',
  'عنبر أشقر طبيعي، رائحة دافئة وجذابة تناسب الأجواء الباردة',
  449.00,
  'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=400',
  c.id,
  4.8,
  92,
  true,
  30
FROM categories c WHERE c.name = 'عطور رجالية'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, original_price, image_url, category_id, rating, reviews_count, in_stock, stock_quantity)
SELECT 
  'زعفران إيراني أصيل',
  'زعفران إيراني خالص، رائحة مميزة وفريدة تضفي لمسة من الفخامة',
  199.00,
  249.00,
  'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg?auto=compress&cs=tinysrgb&w=400',
  c.id,
  4.5,
  67,
  true,
  40
FROM categories c WHERE c.name = 'عطور مشتركة'
ON CONFLICT DO NOTHING;

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- إضافة المشغلات لتحديث updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();