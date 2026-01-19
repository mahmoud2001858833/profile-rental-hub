-- Create a function to get merchant public info bypassing RLS
CREATE OR REPLACE FUNCTION public.get_merchant_public_info(merchant_ids uuid[])
RETURNS TABLE (
  user_id uuid,
  display_name varchar,
  avatar_url text,
  page_slug varchar
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.display_name, p.avatar_url, p.page_slug
  FROM profiles p
  WHERE p.user_id = ANY(merchant_ids)
    AND p.user_type = 'merchant';
$$;