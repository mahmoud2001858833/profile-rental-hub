
-- Fix notifications insert - only allow service role (triggers use SECURITY DEFINER)
DROP POLICY "Service role can insert notifications" ON public.notifications;

-- Fix ratings insert - require at least a non-empty customer_name
DROP POLICY "Authenticated users can insert ratings" ON public.ratings;
CREATE POLICY "Anyone can insert ratings"
  ON public.ratings FOR INSERT
  WITH CHECK (length(customer_name) > 0);
