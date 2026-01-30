-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_merchant_public_info(uuid[]);

-- Create updated function with phone info
CREATE FUNCTION public.get_merchant_public_info(merchant_ids uuid[])
RETURNS TABLE(user_id uuid, display_name character varying, avatar_url text, page_slug character varying, whatsapp_number character varying, phone character varying)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.user_id, p.display_name, p.avatar_url, p.page_slug, p.whatsapp_number, p.phone
  FROM profiles p
  WHERE p.user_id = ANY(merchant_ids)
    AND p.user_type = 'merchant';
$$;