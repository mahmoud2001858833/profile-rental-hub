-- Add delivery_cost column to items table
ALTER TABLE public.items 
ADD COLUMN delivery_cost numeric DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN public.items.delivery_cost IS 'Cost of delivery for this item, added to item price when delivery is selected';