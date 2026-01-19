-- Create function to disable expired merchant pages
CREATE OR REPLACE FUNCTION public.disable_expired_merchant_pages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Disable pages for merchants who don't have an approved payment in the last 30 days
  UPDATE public.profiles
  SET page_enabled = false
  WHERE user_type = 'merchant'
    AND page_enabled = true
    AND user_id NOT IN (
      SELECT DISTINCT user_id 
      FROM public.payment_receipts 
      WHERE status = 'approved' 
        AND created_at > NOW() - INTERVAL '30 days'
    );
END;
$function$;