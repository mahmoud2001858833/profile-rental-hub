-- Add category column to items table for food categories
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'أطباق رئيسية';

-- Create index for better filtering performance
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);