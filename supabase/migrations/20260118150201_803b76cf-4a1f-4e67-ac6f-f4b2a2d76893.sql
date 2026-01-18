-- Create table for item images (gallery)
CREATE TABLE public.item_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.item_images ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own item images
CREATE POLICY "Users can manage their own item images"
ON public.item_images
FOR ALL
USING (auth.uid() = user_id);

-- Policy: Public can view item images if item is active and page is enabled
CREATE POLICY "Public item images are viewable"
ON public.item_images
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM items i
    JOIN profiles p ON p.user_id = i.user_id
    WHERE i.id = item_images.item_id
    AND i.is_active = true
    AND p.page_enabled = true
  )
);

-- Create index for faster queries
CREATE INDEX idx_item_images_item_id ON public.item_images(item_id);
CREATE INDEX idx_item_images_user_id ON public.item_images(user_id);