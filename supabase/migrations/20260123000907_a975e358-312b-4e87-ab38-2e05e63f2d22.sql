-- Add currency column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS currency character varying DEFAULT 'JOD';