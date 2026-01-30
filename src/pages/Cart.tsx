import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart, CartItem } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft, Package, ExternalLink, MessageCircle } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const { items, updateQuantity, removeItem, getTotal } = useCart();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  // Check if merchant trying to access cart
  useEffect(() => {
    if (userType === 'merchant') {
      toast({
        title: t('auth.notForMerchants'),
        description: t('auth.merchantCantBuy'),
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [userType, navigate, toast, t]);

  // Group items by merchant
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.merchant_id]) {
      acc[item.merchant_id] = {
        merchant_name: item.merchant_name,
        merchant_slug: item.merchant_slug,
        items: [],
        total: 0,
      };
    }
    acc[item.merchant_id].items.push(item);
    acc[item.merchant_id].total += item.price * item.quantity;
    return acc;
  }, {} as Record<string, { merchant_name: string; merchant_slug?: string; items: CartItem[]; total: number }>);

  const ArrowIcon = language === 'ar' ? ArrowRight : ArrowLeft;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">{t('cart.empty')}</h2>
              <p className="text-muted-foreground mb-6">{t('cart.noProducts')}</p>
              <Button asChild>
                <Link to="/browse">{t('cart.browseProducts')}</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/browse">
              <ArrowIcon className="h-4 w-4 mx-1" />
              {t('cart.continueShopping')}
            </Link>
          </Button>
        </div>

        <h1 className="text-2xl font-bold mb-6">{t('cart.title')}</h1>

        <div className="space-y-6 max-w-3xl">
          {Object.entries(groupedItems).map(([merchantId, group]) => (
            <Card key={merchantId}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    {group.merchant_name}
                  </CardTitle>
                  {group.merchant_slug && (
                    <Button asChild size="sm" className="bg-success hover:bg-success/90">
                      <Link to={`/p/${group.merchant_slug}`}>
                        <MessageCircle className="h-4 w-4 mx-1" />
                        {t('cart.contactCook')}
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold truncate">{item.title}</h4>
                        {item.merchant_slug && (
                          <Link
                            to={`/p/${item.merchant_slug}`}
                            className="text-primary hover:text-primary/80"
                            title={t('cart.viewCookPage')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                      <p className="text-primary font-bold">{item.price.toFixed(2)} {item.currency}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive ms-auto"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="font-bold">{(item.price * item.quantity).toFixed(2)} {item.currency}</p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between font-bold">
                  <span>{t('cart.subtotal')}:</span>
                  <span className="text-primary text-lg">{group.total.toFixed(2)} {group.items[0]?.currency || 'د.أ'}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Total */}
          <Card className="bg-muted/50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between text-xl font-bold">
                <span>{t('cart.total')}:</span>
                <span className="text-primary">
                  {getTotal().toFixed(2)} {items[0]?.currency || 'د.أ'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground text-center mt-4">
                {t('cart.contactCookToOrder')}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Cart;