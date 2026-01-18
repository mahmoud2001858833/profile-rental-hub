-- Allow admins to delete any item
CREATE POLICY "Admins can delete any item" 
ON public.items 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));