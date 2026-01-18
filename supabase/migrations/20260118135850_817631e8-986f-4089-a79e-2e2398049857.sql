-- جدول الملفات الشخصية للمستخدمين
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  whatsapp_number VARCHAR(20),
  has_delivery BOOLEAN DEFAULT false,
  page_enabled BOOLEAN DEFAULT false,
  page_slug VARCHAR(50) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول الاشتراكات
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'past_due', 'canceled', 'trialing'))
);

-- جدول العناصر/المنتجات
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول صور المعرض
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- جدول الموافقة على الشروط
CREATE TABLE public.terms_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agreed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address VARCHAR(50),
  UNIQUE(user_id)
);

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms_agreements ENABLE ROW LEVEL SECURITY;

-- سياسات الملفات الشخصية
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public profiles are viewable by slug"
  ON public.profiles FOR SELECT
  USING (page_enabled = true AND page_slug IS NOT NULL);

-- سياسات الاشتراكات
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- سياسات العناصر
CREATE POLICY "Users can manage their own items"
  ON public.items FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public items are viewable"
  ON public.items FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = items.user_id
      AND profiles.page_enabled = true
    )
  );

-- سياسات صور المعرض
CREATE POLICY "Users can manage their own gallery"
  ON public.gallery_images FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public gallery is viewable"
  ON public.gallery_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = gallery_images.user_id
      AND profiles.page_enabled = true
    )
  );

-- سياسات الموافقة على الشروط
CREATE POLICY "Users can view their own agreement"
  ON public.terms_agreements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agreement"
  ON public.terms_agreements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- دالة تحديث updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- triggers للتحديث التلقائي
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- دالة للتحقق من عدد العناصر (حد أقصى 25)
CREATE OR REPLACE FUNCTION public.check_items_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.items WHERE user_id = NEW.user_id) >= 25 THEN
    RAISE EXCEPTION 'الحد الأقصى للعناصر هو 25';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER enforce_items_limit
  BEFORE INSERT ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.check_items_limit();

-- فهارس لتحسين الأداء
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_page_slug ON public.profiles(page_slug);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_items_user_id ON public.items(user_id);
CREATE INDEX idx_gallery_user_id ON public.gallery_images(user_id);