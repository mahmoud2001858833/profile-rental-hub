import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageCircle, Truck, Loader2 } from 'lucide-react';

interface Profile {
  display_name: string | null;
  bio: string | null;
  phone: string;
  whatsapp_number: string | null;
  has_delivery: boolean;
  avatar_url: string | null;
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
      .select('display_name, bio, phone, whatsapp_number, has_delivery, avatar_url, user_id')
      .eq('page_slug', slug)
      .eq('page_enabled', true)
      .maybeSingle();

    if (profileError || !profileData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setProfile(profileData);

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

      {/* Profile Header */}
      <header className="container py-8">
        <div className="text-center">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || 'صورة الملف الشخصي'}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-card"
            />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-card flex items-center justify-center border-4 border-border">
              <span className="text-3xl">👤</span>
            </div>
          )}
          
          <h1 className="text-2xl font-bold mb-2">
            {profile?.display_name || 'بدون اسم'}
          </h1>
          
          {profile?.bio && (
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              {profile.bio}
            </p>
          )}

          {profile?.has_delivery && (
            <Badge variant="secondary" className="gap-1">
              <Truck className="h-3 w-3" />
              يوجد توصيل
            </Badge>
          )}
        </div>
      </header>

      {/* Contact Buttons */}
      <div className="container pb-6">
        <div className="flex gap-4 justify-center max-w-md mx-auto">
          <Button onClick={handleCall} className="flex-1 gap-2">
            <Phone className="h-4 w-4" />
            اتصال
          </Button>
          {profile?.whatsapp_number && (
            <Button onClick={handleWhatsApp} variant="outline" className="flex-1 gap-2">
              <MessageCircle className="h-4 w-4" />
              واتساب
            </Button>
          )}
        </div>
      </div>

      {/* Items */}
      <section className="container pb-8">
        {items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">لا توجد عناصر للعرض حالياً</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">📦</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 truncate">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {item.description}
                        </p>
                      )}
                      <p className="text-accent font-bold">{item.price.toFixed(2)} ر.س</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <p className="text-center text-sm text-muted-foreground">
          جميع عمليات البيع والدفع والتوصيل تتم مباشرة مع صاحب الصفحة
        </p>
      </footer>
    </div>
  );
};

export default PublicPage;