import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart, CartItem } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft, Package, ExternalLink, MessageCircle, CheckCircle, Loader2, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Cart = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const { items, updateQuantity, removeItem, getTotal, clearMerchantItems } = useCart();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [submittingMerchant, setSubmittingMerchant] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<{ name: string; phone: string } | null>(null);

  // Fetch customer info if logged in
  useEffect(() => {
    const fetchCustomerInfo = async () => {
      if (!user) return;
      
      const { data: customerProfile } = await supabase
        .from('customer_profiles')
        .select('display_name, phone')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (customerProfile) {
        setCustomerInfo({
          name: customerProfile.display_name || '',
          phone: customerProfile.phone || ''
        });
      }
    };
    fetchCustomerInfo();
  }, [user]);

  const handleConfirmOrder = async (merchantId: string, merchantItems: CartItem[], total: number) => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: t('cart.loginToConfirm'),
        description: t('cart.loginToContinue'),
        variant: 'destructive',
      });
      navigate('/auth?type=customer');
      return;
    }

    // Extract phone from user email as fallback
    const userPhone = user.email?.replace('.customer@phone.local', '').replace('@phone.local', '') || '';
    const customerName = customerInfo?.name || userPhone;
    const customerPhone = customerInfo?.phone || userPhone;

    setSubmittingMerchant(merchantId);

    try {
      // First, verify all items are still available
      const itemIds = merchantItems.map(item => item.id);
      const { data: availableItems, error: checkError } = await supabase
        .from('items')
        .select('id, price, title, is_active')
        .in('id', itemIds)
        .eq('is_active', true);

      if (checkError) throw checkError;

      // Check if any items are unavailable
      const availableItemIds = new Set(availableItems?.map(item => item.id) || []);
      const unavailableItems = merchantItems.filter(item => !availableItemIds.has(item.id));

      if (unavailableItems.length > 0) {
        // Remove unavailable items from cart
        unavailableItems.forEach(item => removeItem(item.id));
        
        toast({
          title: t('cart.itemsUnavailable'),
          description: t('cart.someItemsRemoved'),
          variant: 'destructive',
        });
        return;
      }

      // Recalculate total with verified prices
      const verifiedTotal = merchantItems.reduce((sum, item) => {
        const verifiedItem = availableItems?.find(ai => ai.id === item.id);
        return sum + (verifiedItem?.price || item.price) * item.quantity;
      }, 0);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          merchant_id: merchantId,
          customer_id: user.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          total_amount: verifiedTotal,
          currency: merchantItems[0]?.currency || 'JOD',
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items with verified prices
      const orderItems = merchantItems.map(item => {
        const verifiedItem = availableItems?.find(ai => ai.id === item.id);
        return {
          order_id: order.id,
          item_id: item.id,
          item_title: verifiedItem?.title || item.title,
          item_price: verifiedItem?.price || item.price,
          quantity: item.quantity
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear merchant items from cart
      clearMerchantItems(merchantId);

      toast({
        title: t('cart.orderConfirmed'),
        description: t('cart.orderSentToMerchant'),
      });

      // Navigate to merchant page
      const merchantSlug = merchantItems[0]?.merchant_slug;
      if (merchantSlug) {
        navigate(`/p/${merchantSlug}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: t('common.error'),
        description: t('cart.orderFailed'),
        variant: 'destructive',
      });
    } finally {
      setSubmittingMerchant(null);
    }
  };

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
        subtotal: 0,
        deliveryTotal: 0,
        total: 0,
      };
    }
    acc[item.merchant_id].items.push(item);
    const itemTotal = item.price * item.quantity;
    const deliveryCost = (item.has_delivery && item.delivery_cost) ? item.delivery_cost * item.quantity : 0;
    acc[item.merchant_id].subtotal += itemTotal;
    acc[item.merchant_id].deliveryTotal += deliveryCost;
    acc[item.merchant_id].total += itemTotal + deliveryCost;
    return acc;
  }, {} as Record<string, { merchant_name: string; merchant_slug?: string; items: CartItem[]; subtotal: number; deliveryTotal: number; total: number }>);

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
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    {group.merchant_name}
                  </CardTitle>
                  <div className="flex gap-2">
                    {group.merchant_slug && (
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/p/${group.merchant_slug}`}>
                          <ExternalLink className="h-4 w-4 mx-1" />
                          {t('cart.viewCookPage')}
                        </Link>
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      className="bg-success hover:bg-success/90"
                      onClick={() => handleConfirmOrder(merchantId, group.items, group.total)}
                      disabled={submittingMerchant === merchantId}
                    >
                      {submittingMerchant === merchantId ? (
                        <Loader2 className="h-4 w-4 animate-spin mx-1" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mx-1" />
                      )}
                      {t('cart.confirmOrder')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.items.map((item) => {
                  const itemDeliveryCost = (item.has_delivery && item.delivery_cost) ? item.delivery_cost : 0;
                  const itemTotalWithDelivery = (item.price + itemDeliveryCost) * item.quantity;
                  
                  return (
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold truncate">{item.title}</h4>
                          {item.has_delivery && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success/10 text-success text-xs">
                              <Truck className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-primary font-bold">{item.price.toFixed(2)} {item.currency}</p>
                          {item.has_delivery && itemDeliveryCost > 0 && (
                            <span className="text-xs text-muted-foreground">
                              + {itemDeliveryCost.toFixed(2)} {language === 'ar' ? 'توصيل' : 'delivery'}
                            </span>
                          )}
                        </div>
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
                        <p className="font-bold">{itemTotalWithDelivery.toFixed(2)} {item.currency}</p>
                        {item.has_delivery && itemDeliveryCost > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {language === 'ar' ? 'شامل التوصيل' : 'incl. delivery'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                <Separator />
                {group.deliveryTotal > 0 && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Truck className="h-4 w-4" />
                      {language === 'ar' ? 'تكلفة التوصيل:' : 'Delivery Cost:'}
                    </span>
                    <span>{group.deliveryTotal.toFixed(2)} {group.items[0]?.currency || 'د.أ'}</span>
                  </div>
                )}
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
                  {Object.values(groupedItems).reduce((sum, group) => sum + group.total, 0).toFixed(2)} {items[0]?.currency || 'د.أ'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Cart;