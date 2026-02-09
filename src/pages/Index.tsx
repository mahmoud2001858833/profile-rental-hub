import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { useCart } from "@/hooks/useCart";
import Header from "@/components/Header";
import CategoryFilter from "@/components/CategoryFilter";
import CountryFilter from "@/components/CountryFilter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, ChefHat, Truck, MessageCircle, Instagram, Facebook } from "lucide-react";
import { toast } from "sonner";
import logoImage from "@/assets/logo-main.png";

interface Item {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  currency: string | null;
  user_id: string;
  category: string | null;
  country: string | null;
  has_delivery?: boolean;
}

interface MerchantInfo {
  display_name: string;
  page_slug: string;
  avatar_url: string | null;
  country: string | null;
}

const Index = () => {
  const { t, dir } = useLanguage();
  const { addItem } = useCart();
  const [items, setItems] = useState<Item[]>([]);
  const [merchantsInfo, setMerchantsInfo] = useState<Record<string, MerchantInfo>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    
    const { data: itemsData, error } = await supabase
      .from('items')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
      return;
    }

    if (itemsData && itemsData.length > 0) {
      const merchantIds = [...new Set(itemsData.map(item => item.user_id))];
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name, page_slug, avatar_url, country')
        .in('user_id', merchantIds)
        .eq('page_enabled', true);

      if (profilesData) {
        const merchantMap: Record<string, MerchantInfo> = {};
        profilesData.forEach(profile => {
          merchantMap[profile.user_id] = {
            display_name: profile.display_name || 'تاجر',
            page_slug: profile.page_slug || '',
            avatar_url: profile.avatar_url,
            country: profile.country,
          };
        });
        setMerchantsInfo(merchantMap);
      }
      setItems(itemsData);
    } else {
      setItems([]);
    }
    
    setLoading(false);
  };

  const handleAddToCart = (item: Item) => {
    const merchant = merchantsInfo[item.user_id];
    const currency = getCurrencySymbol(item.currency, merchant?.country || null);
    addItem({
      id: item.id,
      title: item.title,
      price: item.price,
      image_url: item.image_url,
      merchant_id: item.user_id,
      merchant_name: merchant?.display_name || 'تاجر',
      currency: currency,
      merchant_slug: merchant?.page_slug || '',
    });
    toast.success(t('browse.addedToCart'));
  };

  const getCurrencySymbol = (currency: string | null, country: string | null) => {
    if (currency) return currency;
    const countryToCurrency: Record<string, string> = {
      JO: 'د.أ', SA: 'ر.س', AE: 'د.إ', EG: 'ج.م', MA: 'د.م',
      KW: 'د.ك', BH: 'د.ب', QA: 'ر.ق', OM: 'ر.ع', LB: 'ل.ل',
    };
    return country ? countryToCurrency[country] || 'د.أ' : 'د.أ';
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || item.category === selectedCategory;
    const matchesCountry = !selectedCountry || selectedCountry === 'all' || item.country === selectedCountry;
    return matchesSearch && matchesCategory && matchesCountry;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={dir}>
      <Header />

      {/* Small Logo + Tagline */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-6">
        <div className="container flex flex-col items-center gap-2">
          <img 
            src={logoImage} 
            alt="طبخات" 
            className="w-[180px] h-auto object-contain"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}
          />
          <p className="text-destructive text-center text-lg md:text-xl font-bold -mt-8">
            {t('index.heroTitle')}
          </p>
        </div>
      </section>

      {/* Search and Filters - Sticky */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border py-4">
        <div className="container space-y-3">
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
            <Input
              placeholder={t('index.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`h-12 text-base ${dir === 'rtl' ? 'pr-10' : 'pl-10'}`}
            />
          </div>
          <CountryFilter selectedCountry={selectedCountry} onCountryChange={setSelectedCountry} />
          <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        </div>
      </div>

      {/* Items Grid */}
      <main className="container py-8 flex-1">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('browse.noDishes')}</h3>
            <p className="text-muted-foreground">{t('browse.tryChangingFilters')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const merchant = merchantsInfo[item.user_id];
              const currency = getCurrencySymbol(item.currency, merchant?.country || null);
              
              return (
                <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <Link to={merchant?.page_slug ? `/p/${merchant.page_slug}` : '#'}>
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ChefHat className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {item.category && <Badge className="text-xs">{item.category}</Badge>}
                        {item.has_delivery && (
                          <Badge className="text-xs bg-green-600 hover:bg-green-700">
                            <Truck className="h-3 w-3 mr-1" />
                            {t('browse.delivery')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                  <CardContent className="p-3 space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
                    {merchant && (
                      <Link to={`/p/${merchant.page_slug}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                        {merchant.avatar_url && <img src={merchant.avatar_url} alt="" className="w-4 h-4 rounded-full" />}
                        {merchant.display_name}
                      </Link>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-primary">{item.price} {currency}</span>
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={(e) => { e.preventDefault(); handleAddToCart(item); }}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-1">
        <a href="https://wa.me/962799126390" target="_blank" rel="noopener noreferrer"
          className="w-10 h-10 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 relative"
          aria-label="تواصل عبر واتساب">
          <MessageCircle className="h-5 w-5 fill-current" />
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
        </a>
        <span className="text-xs font-medium text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
          تواصل مع طبخات
        </span>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 bg-card/50">
        <div className="container text-center space-y-3 px-4">
          <div className="flex justify-center items-center gap-6">
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t('index.termsConditions')}
            </Link>
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/tabb_khat?utm_source=qr&igsh=MWtqZzY0NWM1bmV3MA==" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61587530040566" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 bg-[#1877F2] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {t('index.tabkhatyRights')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
