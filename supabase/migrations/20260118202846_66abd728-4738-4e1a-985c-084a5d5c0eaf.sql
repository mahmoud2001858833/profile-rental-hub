-- Drop the existing restrictive policy for public items
DROP POLICY IF EXISTS "Public items are viewable" ON public.items;

-- Create new policy that allows viewing active items regardless of page_enabled status
CREATE POLICY "Public items are viewable" 
ON public.items 
FOR SELECT 
USING (is_active = true);