import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageCircle, Truck, Loader2, Package } from 'lucide-react';

interface Profile {
  display_name: string | null;
  bio: string | null;
  phone: string;
  whatsapp_number: string | null;
  has_delivery: boolean;
  avatar_url: string | null;
  cover_url: string | null;
  user_id: string;
}

interface Item {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
}

const PublicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPageData();
    }
  }, [slug]);

  const fetchPageData = async () => {
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, bio, phone, whatsapp_number, has_delivery, avatar_url, cover_url, user_id')
      .eq('page_slug', slug)
      .eq('page_enabled', true)
      .maybeSingle();

    if (profileError || !profileData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setProfile(profileData as Profile);

    // Fetch items
    const { data: itemsData } = await supabase
      .from('items')
      .select('id, title, description, price, image_url')
      .eq('user_id', profileData.user_id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    setItems(itemsData || []);
    setLoading(false);
  };

  const handleCall = () => {
    if (profile?.phone) {
      window.location.href = `tel:${profile.phone}`;
    }
  };

  const handleWhatsApp = () => {
    if (profile?.whatsapp_number) {
      const cleanNumber = profile.whatsapp_number.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <h1 className="text-2xl font-bold mb-2">الصفحة غير موجودة</h1>
        <p className="text-muted-foreground text-center">
          هذه الصفحة غير متاحة أو تم تعطيلها
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Disclaimer */}
      <div className="bg-card border-b border-border py-2 px-4">
        <p className="text-center text-xs text-muted-foreground">
          المنصة تؤجّر صفحات عرض رقمية فقط، وليست متجرًا إلكترونيًا
        </p>
      </div>

      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/20 to-accent/20">
        {profile?.cover_url ? (
          <img
            src={profile.cover_url}
            alt="صورة الغلاف"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10" />
        )}
        
        {/* Avatar overlapping cover */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || 'صورة الملف الشخصي'}
              className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-background shadow-xl"
            />
          ) : (
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-card flex items-center justify-center border-4 border-background shadow-xl">
              <span className="text-4xl">👤</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <header className="container pt-16 pb-6">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {profile?.display_name || 'بدون اسم'}
          </h1>
          
          {profile?.bio && (
            <p className="text-muted-foreground max-w-md mx-auto mb-4 leading-relaxed">
              {profile.bio}
            </p>
          )}

          {profile?.has_delivery && (
            <Badge variant="secondary" className="gap-1 px-4 py-1">
              <Truck className="h-3 w-3" />
              يوجد توصيل
            </Badge>
          )}
        </div>
      </header>

      {/* Contact Buttons */}
      <div className="container pb-8">
        <div className="flex gap-4 justify-center max-w-md mx-auto">
          <Button onClick={handleCall} size="lg" className="flex-1 gap-2 shadow-lg shadow-primary/20">
            <Phone className="h-4 w-4" />
            اتصال
          </Button>
          {profile?.whatsapp_number && (
            <Button onClick={handleWhatsApp} variant="outline" size="lg" className="flex-1 gap-2">
              <MessageCircle className="h-4 w-4" />
              واتساب
            </Button>
          )}
        </div>
      </div>

      {/* Items */}
      <section className="container pb-12">
        <h2 className="text-lg font-bold mb-4 text-center">المنتجات والخدمات</h2>
        {items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">لا توجد عناصر للعرض حالياً</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                {/* Content */}
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-1 mb-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  <p className="text-accent font-bold">{item.price.toFixed(2)} ر.س</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 bg-card">
        <p className="text-center text-sm text-muted-foreground">
          جميع عمليات البيع والدفع والتوصيل تتم مباشرة مع صاحب الصفحة
        </p>
      </footer>
    </div>
  );
};

export default PublicPage;