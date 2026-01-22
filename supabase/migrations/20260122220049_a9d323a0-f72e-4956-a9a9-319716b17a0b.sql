-- إصلاح سياسة RLS للطلبات - تحويلها إلى PERMISSIVE
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

CREATE POLICY "Anyone can create orders" ON orders
FOR INSERT
TO authenticated
WITH CHECK (true);

-- إصلاح سياسة RLS لعناصر الطلبات
DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;

CREATE POLICY "Anyone can insert order items" ON order_items
FOR INSERT
TO authenticated
WITH CHECK (true);