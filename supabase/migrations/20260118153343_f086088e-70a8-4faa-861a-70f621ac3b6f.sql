-- إضافة عمود نوع المستخدم للملفات الشخصية
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) NOT NULL DEFAULT 'merchant';

-- تحديث المستخدمين الحاليين كتجار
UPDATE public.profiles SET user_type = 'merchant' WHERE user_type IS NULL;

-- إنشاء جدول ملفات العملاء
CREATE TABLE public.customer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name VARCHAR(200),
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- سياسات العملاء
CREATE POLICY "Users can view their own customer profile"
  ON public.customer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customer profile"
  ON public.customer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer profile"
  ON public.customer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ربط الطلبات بالعميل
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_id UUID;

-- Trigger لتحديث updated_at
CREATE TRIGGER update_customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- فهرس
CREATE INDEX idx_customer_profiles_user_id ON public.customer_profiles(user_id);