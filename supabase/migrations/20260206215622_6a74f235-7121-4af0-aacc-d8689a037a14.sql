-- Create table for password reset OTPs
CREATE TABLE public.password_reset_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'merchant')),
  reset_token VARCHAR(255),
  reset_token_expires_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_password_reset_otps_phone ON public.password_reset_otps(phone, user_type);
CREATE INDEX idx_password_reset_otps_reset_token ON public.password_reset_otps(reset_token) WHERE reset_token IS NOT NULL;

-- Enable RLS
ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;

-- No direct access from frontend - all operations go through edge functions with service_role
-- This ensures security as OTPs are handled server-side only

-- Clean up expired OTPs periodically (optional - can be done via cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.password_reset_otps 
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$;