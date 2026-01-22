-- إضافة سياسة للعملاء لقراءة طلباتهم الخاصة
CREATE POLICY "Customers can view their own orders" ON orders
FOR SELECT
TO authenticated
USING (customer_id = auth.uid());

-- إضافة سياسة للعملاء لقراءة عناصر طلباتهم
CREATE POLICY "Customers can view their order items" ON order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.customer_id = auth.uid()
  )
);