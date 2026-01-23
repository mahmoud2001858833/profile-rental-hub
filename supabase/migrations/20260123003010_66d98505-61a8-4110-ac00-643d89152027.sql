-- Add country column to items table for filtering
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS country VARCHAR(5) DEFAULT 'JO';