-- Add free trial tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS free_trial_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS free_trial_used BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_free_trial ON public.profiles(free_trial_used, free_trial_started_at);