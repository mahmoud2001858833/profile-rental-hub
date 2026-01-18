import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { Search, ShoppingCart, Package, Plus, Store, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  user_id: string;
  merchant_name: string;
  merchant_avatar: string | null;
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { addItem, getItemCount } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    // Fetch active items from merchants with enabled pages
    const { data: items, error } = await supabase
      .from('items')
      .select(`
        id,
        title,
        description,
        price,
        image_url,
        user_id
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
      return;
    }

    // Get merchant profiles for these items
    const merchantIds = [...new Set(items?.map(i => i.user_id) || [])];
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', merchantIds)
      .eq('page_enabled', true);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    const productsWithMerchants = (items || [])
      .filter(item => profileMap.has(item.user_id))
      .map(item => {
        const profile = profileMap.get(item.user_id);
        return {
          ...item,
          merchant_name: profile?.display_name || 'تاجر',
          merchant_avatar: profile?.avatar_url || null,
        };
      });

    setProducts(productsWithMerchants);
    setLoading(false);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
      merchant_id: product.user_id,
      merchant_name: product.merchant_name,
    });
    toast({
      title: 'تمت الإضافة',
      description: `تم إضافة "${product.title}" للسلة`,
    });
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.merchant_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cartCount = getItemCount();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Search and Cart Bar */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن منتج أو تاجر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Button variant="outline" className="relative" asChild>
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
        </div>
      </div>

      {/* Products Grid */}
      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">تصفح المنتجات</h1>
          <p className="text-muted-foreground text-sm">
            {filteredProducts.length} منتج
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'جرب البحث بكلمات مختلفة' : 'لم يتم إضافة منتجات بعد'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
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
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm truncate mb-1">{product.title}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    {product.merchant_avatar ? (
                      <img
                        src={product.merchant_avatar}
                        alt={product.merchant_name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : (
                      <Store className="w-3 h-3 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground truncate">
                      {product.merchant_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-primary font-bold">{product.price.toFixed(2)} ر.س</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      onClick={() => handleAddToCart(product)}
                    >
                      <Plus className="h-3 w-3 ml-1" />
                      أضف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Shop;
