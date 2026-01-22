-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;

-- إنشاء سياسات PERMISSIVE جديدة للطلبات
CREATE POLICY "Authenticated users can create orders" ON orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- إنشاء سياسة PERMISSIVE لعناصر الطلبات  
CREATE POLICY "Authenticated users can insert order items" ON order_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);