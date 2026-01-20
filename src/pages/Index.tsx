import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import CountryFilter, { COUNTRIES, getCurrencySymbol } from '@/components/CountryFilter';
import FloatingFoodIcons from '@/components/FloatingFoodIcons';
import { Search, ShoppingCart, Package, Plus, Store, Loader2, ChefHat, LogIn } from 'lucide-react';
import logoImage from '@/assets/logo.jpg';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  user_id: string;
  category: string | null;
  currency: string | null;
  merchant_name: string;
  merchant_avatar: string | null;
  merchant_slug: string | null;
  merchant_country: string | null;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const { addItem, getItemCount } = useCart();
  const { user, userType } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data: items, error } = await supabase
      .from('items')
      .select(`
        id,
        title,
        description,
        price,
        image_url,
        user_id,
        category,
        currency
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
      return;
    }

    const merchantIds = [...new Set(items?.map(i => i.user_id) || [])];
    
    if (merchantIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    // Use RPC function to get merchant info bypassing RLS
    const { data: profiles } = await supabase
      .rpc('get_merchant_public_info', { merchant_ids: merchantIds });

    const profileMap = new Map(profiles?.map((p: { user_id: string; display_name: string | null; avatar_url: string | null; page_slug: string | null; country?: string | null }) => [p.user_id, p]) || []);

    const productsWithMerchants = (items || [])
      .map(item => {
        const profile = profileMap.get(item.user_id);
        return {
          ...item,
          merchant_name: profile?.display_name || 'طباخ',
          merchant_avatar: profile?.avatar_url || null,
          merchant_slug: profile?.page_slug || null,
          merchant_country: profile?.country || 'JO',
        };
      });

    setProducts(productsWithMerchants);
    setLoading(false);
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginToCart'),
      });
      navigate('/auth?type=customer');
      return;
    }

    if (userType === 'merchant') {
      toast({
        title: t('auth.notForMerchants'),
        description: t('auth.merchantCantBuy'),
        variant: 'destructive',
      });
      return;
    }

    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
      merchant_id: product.user_id,
      merchant_name: product.merchant_name,
    });
    toast({
      title: t('cart.added'),
      description: `${t('cart.addedTo')} "${product.title}" ${t('cart.toCart')}`,
    });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.merchant_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesCountry = selectedCountry === 'all' || p.merchant_country === selectedCountry;
    
    return matchesSearch && matchesCategory && matchesCountry;
  });

  const cartCount = getItemCount();

  // Get country flag for product
  const getCountryFlag = (countryCode: string | null) => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    return country?.flag || '🌍';
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Banner - White Background with Floating Icons */}
      <section className="bg-white py-16 relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        
        {/* Floating Food Icons */}
        <FloatingFoodIcons />
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-2xl bg-primary/5 rotate-12 animate-float hidden lg:block" />
        <div className="absolute bottom-10 right-10 w-24 h-24 rounded-2xl bg-primary/5 -rotate-12 animate-float hidden lg:block" style={{ animationDelay: '1s' }} />
        
        <div className="container relative z-10 text-center">
          {/* Logo Image */}
          <img 
            src={logoImage} 
            alt="طبخات" 
            className="w-32 h-32 md:w-40 md:h-40 rounded-3xl mx-auto mb-6 shadow-2xl object-cover border-4 border-white"
          />
          
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <ChefHat className="h-4 w-4" />
            <span>{t('index.tabkhatyPlatform')}</span>
          </div>
          
          {/* Main Marketing Text */}
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="text-primary">{t('index.heroTitle')}</span>
            <br />
            <span className="gradient-text">{t('index.heroSubtitle')}</span>
          </h1>
          
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-lg">
            {t('index.heroDesc')}
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="shadow-xl hover:shadow-2xl transition-shadow" asChild>
                <Link to="/auth?type=merchant">
                  <ChefHat className="ml-2 h-5 w-5" />
                  {t('index.startNow')}
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/auth?type=customer">
                  <LogIn className="ml-2 h-5 w-5" />
                  {t('index.loginToShop')}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Search Bar with Glass Effect */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="container py-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('index.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-white border-primary/20"
              />
            </div>
            <Button variant="outline" className="relative bg-white border-primary/20 hover:bg-primary/5" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>
          
          {/* Country Filter */}
          <CountryFilter 
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
          />
          
          {/* Category Filter */}
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </div>

      {/* Products Grid - Red Cream Gradient Background with Glass Effect */}
      <main className="relative py-12">
        {/* Background Gradient */}
        <div className="absolute inset-0 red-cream-gradient" />
        <div className="absolute inset-0 pattern-dots opacity-20" />
        
        {/* Decorative Glass Elements */}
        <div className="absolute top-20 left-[5%] w-40 h-40 rounded-3xl bg-primary/5 backdrop-blur-sm border border-primary/10 rotate-12 animate-float hidden lg:block" />
        <div className="absolute bottom-32 right-[8%] w-32 h-32 rounded-2xl bg-primary/5 backdrop-blur-sm border border-primary/10 -rotate-6 animate-float hidden lg:block" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 right-[15%] w-20 h-20 rounded-xl bg-accent/5 backdrop-blur-sm border border-accent/10 rotate-45 hidden xl:block" />
        
        <div className="container relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="glass-effect px-6 py-3 rounded-2xl">
              <h2 className="text-xl font-bold gradient-text">{t('index.products')}</h2>
            </div>
            <div className="glass-effect px-4 py-2 rounded-full">
              <p className="text-muted-foreground text-sm">
                {filteredProducts.length} {t('index.product')}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="glass-effect p-8 rounded-2xl">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card className="glass-effect border-primary/10">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">{t('index.noProducts')}</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? t('index.tryDifferent') : t('index.noProductsYet')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('index.areMerchant')}{' '}
                  <Link to="/auth?type=merchant" className="text-primary hover:underline font-medium">
                    {t('index.registerNow')}
                  </Link>
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 glass-card border-primary/10 hover:border-primary/30 glow-card">
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <Button
                    size="icon"
                    className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    onClick={() => handleAddToCart(product)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {product.category && (
                    <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                      {product.category}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm truncate mb-1">{product.title}</h3>
                  
                  {product.merchant_slug ? (
                    <Link 
                      to={`/p/${product.merchant_slug}`}
                      className="flex items-center gap-1.5 mb-2 hover:text-primary transition-colors"
                    >
                      {product.merchant_avatar ? (
                        <img
                          src={product.merchant_avatar}
                          alt={product.merchant_name}
                          className="w-5 h-5 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Store className="w-3 h-3 text-primary" />
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground truncate hover:text-primary">
                        {product.merchant_name}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-1 mb-2">
                      <Store className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate">
                        {product.merchant_name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{getCountryFlag(product.merchant_country)}</span>
                      <p className="text-primary font-bold">
                        {product.price.toFixed(2)} {getCurrencySymbol(product.currency || 'JOD')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      onClick={() => handleAddToCart(product)}
                    >
                      <Plus className="h-3 w-3 ml-1" />
                      {t('index.add')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-white mt-8">
        <div className="container text-center space-y-4">
          <div className="flex justify-center gap-4">
            <Link to="/auth?type=customer" className="text-sm text-primary hover:underline font-medium">
              {t('index.registerCustomer')}
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link to="/auth?type=merchant" className="text-sm text-primary hover:underline font-medium">
              {t('index.registerMerchant')}
            </Link>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              {t('index.termsConditions')}
            </Link>
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