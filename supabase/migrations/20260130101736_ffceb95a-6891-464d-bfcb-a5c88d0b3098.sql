-- Add has_delivery column to items table
ALTER TABLE public.items 
ADD COLUMN has_delivery boolean DEFAULT false;