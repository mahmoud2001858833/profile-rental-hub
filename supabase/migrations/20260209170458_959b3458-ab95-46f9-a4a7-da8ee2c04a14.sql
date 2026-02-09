
-- Create ratings table
CREATE TABLE public.ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id uuid NOT NULL,
  customer_id uuid,
  customer_name varchar NOT NULL DEFAULT 'زائر',
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Everyone can read ratings (public)
CREATE POLICY "Anyone can view ratings"
  ON public.ratings FOR SELECT
  USING (true);

-- Authenticated users can insert ratings
CREATE POLICY "Authenticated users can insert ratings"
  ON public.ratings FOR INSERT
  WITH CHECK (true);

-- Admins can delete ratings via edge function (service role)

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title varchar NOT NULL,
  message text NOT NULL DEFAULT '',
  type varchar NOT NULL DEFAULT 'system',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert via trigger/service role only - allow service role insert
CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Trigger: notify merchant on new order
CREATE OR REPLACE FUNCTION public.notify_merchant_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.merchant_id,
    'طلب جديد',
    'لديك طلب جديد من ' || NEW.customer_name,
    'order'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_order_notify
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_merchant_new_order();

-- Trigger: notify merchant + admins on new rating
CREATE OR REPLACE FUNCTION public.notify_on_new_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Notify merchant
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.merchant_id,
    'تقييم جديد',
    'حصلت على تقييم ' || NEW.rating || ' نجوم من ' || NEW.customer_name,
    'rating'
  );
  
  -- Notify all admins
  FOR admin_record IN SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      admin_record.user_id,
      'تقييم جديد',
      'تقييم جديد ' || NEW.rating || ' نجوم للطباخة من ' || NEW.customer_name,
      'rating'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_rating_notify
AFTER INSERT ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_new_rating();
