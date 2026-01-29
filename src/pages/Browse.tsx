import { useState, useEffect } from "react";
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
import { Search, ShoppingCart, Plus, ChefHat } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

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
}

interface MerchantInfo {
  display_name: string;
  page_slug: string;
  avatar_url: string | null;
  country: string | null;
}

const Browse = () => {
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
    
    // Build query for items - now includes country
    let query = supabase
      .from('items')
      .select('id, title, description, price, image_url, currency, user_id, category, country')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const { data: itemsData, error } = await query;

    if (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
      return;
    }

    if (itemsData && itemsData.length > 0) {
      // Get unique merchant IDs
      const merchantIds = [...new Set(itemsData.map(item => item.user_id))];
      
      // Fetch merchant info
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
        
        // All items are stored, filtering happens in filteredItems
        setItems(itemsData);
      } else {
        setItems(itemsData);
      }
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
    });
    toast.success(t('browse.addedToCart'));
  };

  const getCurrencySymbol = (currency: string | null, country: string | null) => {
    if (currency) return currency;
    const countryToCurrency: Record<string, string> = {
      JO: 'د.أ',
      SA: 'ر.س',
      AE: 'د.إ',
      EG: 'ج.م',
      MA: 'د.م',
      KW: 'د.ك',
      BH: 'د.ب',
      QA: 'ر.ق',
      OM: 'ر.ع',
      LB: 'ل.ل',
    };
    return country ? countryToCurrency[country] || 'د.أ' : 'د.أ';
  };

  // Filter items by search, category, and country
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Handle 'all' as showing everything - 'all' means no filter applied
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || item.category === selectedCategory;
    
    // Filter by item's country, not merchant's country - 'all' means no filter
    const matchesCountry = !selectedCountry || selectedCountry === 'all' || item.country === selectedCountry;
    
    return matchesSearch && matchesCategory && matchesCountry;
  });

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      
      {/* Search and Filters */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border py-4">
        <div className="container space-y-4">
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
            <Input
              placeholder={t('index.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`h-12 text-base ${dir === 'rtl' ? 'pr-10' : 'pl-10'}`}
            />
          </div>
          
          {/* Country Filter - Row 1 */}
          <div className="overflow-x-auto pb-2">
            <CountryFilter 
              selectedCountry={selectedCountry} 
              onCountryChange={setSelectedCountry} 
            />
          </div>
          
          {/* Category Filter - Row 2 */}
          <div className="overflow-x-auto pb-2">
            <CategoryFilter 
              selectedCategory={selectedCategory} 
              onCategoryChange={setSelectedCategory} 
            />
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <main className="container py-8">
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
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ChefHat className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {item.category && (
                        <Badge className="absolute top-2 right-2 text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                  </Link>
                  
                  <CardContent className="p-3 space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
                    
                    {merchant && (
                      <Link 
                        to={`/p/${merchant.page_slug}`}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        {merchant.avatar_url && (
                          <img src={merchant.avatar_url} alt="" className="w-4 h-4 rounded-full" />
                        )}
                        {merchant.display_name}
                      </Link>
                    )}
                    
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-primary">
                        {item.price} {currency}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(item);
                        }}
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
      </main>
    </div>
  );
};

export default Browse;
