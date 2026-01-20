-- Add country column to profiles table for merchants
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country VARCHAR(3) DEFAULT 'JO';

-- Add currency column to items table
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'JOD';

-- Create index for country filtering
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_items_currency ON public.items(currency);