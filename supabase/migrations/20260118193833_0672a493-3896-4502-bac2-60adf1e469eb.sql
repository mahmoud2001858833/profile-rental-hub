-- Fix Issue 1: Create a public view for profiles that excludes the phone field
-- The phone field is used for authentication and should not be publicly accessible
-- whatsapp_number is intentionally public for customer contact

CREATE VIEW public.public_profiles 
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  display_name,
  bio,
  avatar_url,
  cover_url,
  whatsapp_number,
  page_slug,
  page_enabled,
  has_delivery,
  created_at,
  updated_at
FROM profiles 
WHERE page_enabled = true AND page_slug IS NOT NULL;

-- Grant select on the view to public
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Fix Issue 2: Create a trigger to validate order item prices against the items table
-- This prevents price manipulation attacks where clients send fake prices

CREATE OR REPLACE FUNCTION public.validate_order_item_price()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actual_price NUMERIC;
  actual_title VARCHAR;
BEGIN
  -- Get the actual price and title from the items table
  SELECT price, title INTO actual_price, actual_title
  FROM items 
  WHERE id = NEW.item_id AND is_active = true;
  
  -- Check if item exists and is active
  IF actual_price IS NULL THEN
    RAISE EXCEPTION 'Item not found or inactive: %', NEW.item_id;
  END IF;
  
  -- Validate that the submitted price matches the actual price
  IF NEW.item_price != actual_price THEN
    RAISE EXCEPTION 'Price mismatch for item %: expected %, got %', NEW.item_id, actual_price, NEW.item_price;
  END IF;
  
  -- Optionally validate title matches (to prevent tampering)
  IF NEW.item_title != actual_title THEN
    -- Auto-correct the title to the actual value
    NEW.item_title := actual_title;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger that validates price before insert
CREATE TRIGGER check_order_item_price
  BEFORE INSERT ON order_items
  FOR EACH ROW 
  EXECUTE FUNCTION public.validate_order_item_price();