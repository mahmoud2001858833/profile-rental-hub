import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { useCart } from '@/hooks/useCart';
import { getCurrencySymbol } from '@/components/CountryFilter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageCircle, Truck, Loader2, Package, Copy, Check, Plus, ShoppingCart } from 'lucide-react';
import ImageGallery from '@/components/ui/image-gallery';
import LanguageToggle from '@/components/LanguageToggle';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Profile {
  display_name: string | null;
  bio: string | null;
  whatsapp_number: string | null;
  has_delivery: boolean;
  avatar_url: string | null;
  cover_url: string | null;
  user_id: string;
}

interface ItemImage {
  id: string;
  image_url: string;
  sort_order: number;
}

interface Item {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  currency: string | null;
  has_delivery?: boolean;
  delivery_cost?: number;
  gallery_images?: ItemImage[];
}

const PublicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, dir } = useLanguage();
  const { addItem, getItemCount } = useCart();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAddToCart = (item: Item) => {
    if (!profile) return;
    
    const currencySymbol = getCurrencySymbol(item.currency || 'JOD');
    
    addItem({
      id: item.id,
      title: item.title,
      price: item.price,
      image_url: item.image_url,
      merchant_id: profile.user_id,
      merchant_name: profile.display_name || t('public.noName'),
      currency: currencySymbol,
      merchant_slug: slug,
      has_delivery: item.has_delivery || false,
      delivery_cost: item.delivery_cost || 0
    });

    toast.success(dir === 'rtl' ? `تم إضافة ${item.title} للسلة` : `${item.title} added to cart`);
  };

  useEffect(() => {
    if (slug) {
      fetchPageData();
    }
  }, [slug]);

  const fetchPageData = async () => {
    // Fetch profile from public_profiles view (excludes sensitive phone field)
    const { data: profileData, error: profileError } = await supabase
      .from('public_profiles')
      .select('display_name, bio, whatsapp_number, has_delivery, avatar_url, cover_url, user_id')
      .eq('page_slug', slug)
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
      .select('id, title, description, price, image_url, currency, has_delivery, delivery_cost')
      .eq('user_id', profileData.user_id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (itemsData) {
      // Fetch gallery images for all items
      const itemIds = itemsData.map(item => item.id);
      const { data: galleryData } = await supabase
        .from('item_images')
        .select('id, item_id, image_url, sort_order')
        .in('item_id', itemIds)
        .order('sort_order', { ascending: true });

      // Map gallery images to items
      const itemsWithGallery = itemsData.map(item => ({
        ...item,
        gallery_images: galleryData?.filter(img => img.item_id === item.id) || [],
      }));

      setItems(itemsWithGallery);
    }
    
    setLoading(false);
  };

  const handleCall = () => {
    if (profile?.whatsapp_number) {
      const cleanNumber = profile.whatsapp_number.replace(/[^0-9]/g, '');
      window.location.href = `tel:+${cleanNumber}`;
    }
  };

  const handleWhatsApp = () => {
    if (profile?.whatsapp_number) {
      const cleanNumber = profile.whatsapp_number.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    }
  };

  const copyPhone = async () => {
    if (profile?.whatsapp_number) {
      await navigator.clipboard.writeText(profile.whatsapp_number);
      setCopied(true);
      toast.success(dir === 'rtl' ? 'تم نسخ الرقم' : 'Phone copied');
      setTimeout(() => setCopied(false), 2000);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4" dir={dir}>
        <h1 className="text-2xl font-bold mb-2">{t('public.notFound')}</h1>
        <p className="text-muted-foreground text-center">
          {t('public.notAvailable')}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      {/* Disclaimer with Language Toggle and Cart */}
      <div className="bg-card border-b border-border py-2 px-4">
        <div className="container flex items-center justify-between">
          <p className="text-xs text-muted-foreground flex-1">
            {t('public.disclaimer')}
          </p>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Link>
            </Button>
            <LanguageToggle />
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/20 to-accent/20">
        {profile?.cover_url ? (
          <img
            src={profile.cover_url}
            alt="Cover"
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
              alt={profile.display_name || t('public.noName')}
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
            {profile?.display_name || t('public.noName')}
          </h1>
          
          {profile?.bio && (
            <p className="text-muted-foreground max-w-md mx-auto mb-4 leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* WhatsApp Number Display (phone field is private for auth only) */}
          {profile?.whatsapp_number && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg">
                <Phone className="h-4 w-4 text-primary" />
                <span className="font-medium" dir="ltr">{profile.whatsapp_number}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={copyPhone}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {profile?.has_delivery && (
            <Badge variant="secondary" className="gap-1 px-4 py-1">
              <Truck className="h-3 w-3" />
              {t('public.hasDelivery')}
            </Badge>
          )}
        </div>
      </header>

      {/* Contact Buttons - Only show if whatsapp_number is set */}
      {profile?.whatsapp_number && (
        <div className="container pb-8">
          {/* Contact Title */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-border" />
            <span className="text-sm font-semibold text-muted-foreground">
              {dir === 'rtl' ? 'تواصل مع الطباخة' : 'Contact the Cook'}
            </span>
            <div className="h-px w-12 bg-border" />
          </div>
          <div className="flex gap-4 justify-center max-w-md mx-auto">
            <Button onClick={handleCall} size="lg" className="flex-1 gap-2 shadow-lg shadow-primary/20">
              <Phone className="h-4 w-4" />
              {t('public.call')}
            </Button>
            <Button onClick={handleWhatsApp} size="lg" className="flex-1 gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white">
              <MessageCircle className="h-4 w-4" />
              {t('public.whatsapp')}
            </Button>
          </div>
        </div>
      )}

      {/* Items */}
      <section className="container pb-12">
        <h2 className="text-lg font-bold mb-4 text-center">{t('public.productsServices')}</h2>
        {items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">{t('public.noItems')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {items.map((item) => {
              const galleryUrls = item.gallery_images?.map(img => img.image_url) || [];
              const hasGallery = galleryUrls.length > 0 || item.image_url;
              
              return (
                <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  {/* Image Gallery or Placeholder */}
                  {hasGallery ? (
                    <ImageGallery
                      mainImage={item.image_url}
                      images={galleryUrls}
                      alt={item.title}
                    />
                  ) : (
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  {/* Content */}
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-1 mb-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-accent font-bold">{item.price.toFixed(2)} {getCurrencySymbol(item.currency || 'JOD')}</p>
                        {item.has_delivery && item.delivery_cost && item.delivery_cost > 0 && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            +{item.delivery_cost.toFixed(2)} {dir === 'rtl' ? 'توصيل' : 'delivery'}
                          </p>
                        )}
                      </div>
                      <Button
                        size="icon"
                        className="h-8 w-8 bg-success hover:bg-success/90 rounded-full"
                        onClick={() => handleAddToCart(item)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 bg-card">
        <p className="text-center text-sm text-muted-foreground">
          {t('public.salesDisclaimer')}
        </p>
      </footer>
    </div>
  );
};

export default PublicPage;