import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useCart, CartItem } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft, Package, Loader2, CheckCircle, Phone, MessageCircle, ExternalLink } from 'lucide-react';
import { z } from 'zod';

const Cart = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, userType } = useAuth();
  const { items, updateQuantity, removeItem, clearMerchantItems, getTotal } = useCart();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [orderForm, setOrderForm] = useState({ name: '', phone: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [confirmedMerchant, setConfirmedMerchant] = useState<{
    name: string;
    phone: string | null;
    whatsapp: string | null;
  } | null>(null);

  const orderSchema = z.object({
    name: z.string().min(2, t('cart.nameRequired')).max(200),
    phone: z.string()
      .min(7, t('cart.phoneTooShort'))
      .max(20, t('cart.phoneTooLong'))
      .regex(/^[\d\s+\-()]+$/, t('cart.phoneInvalid')),
    notes: z.string().max(500).optional(),
  });

  // Check if merchant trying to access cart
  useEffect(() => {
    if (!authLoading && userType === 'merchant') {
      toast({
        title: t('auth.notForMerchants'),
        description: t('auth.merchantCantBuy'),
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [authLoading, userType, navigate, toast, t]);

  // Group items by merchant
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.merchant_id]) {
      acc[item.merchant_id] = {
        merchant_name: item.merchant_name,
        items: [],
        total: 0,
      };
    }
    acc[item.merchant_id].items.push(item);
    acc[item.merchant_id].total += item.price * item.quantity;
    return acc;
  }, {} as Record<string, { merchant_name: string; items: CartItem[]; total: number }>);

  const handleSubmitOrder = async (merchantId: string) => {
    const result = orderSchema.safeParse(orderForm);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const merchantGroup = groupedItems[merchantId];
    if (!merchantGroup) return;

    setSubmitting(true);

    try {
      // Create order with currency from first item
      const orderCurrency = merchantGroup.items[0]?.currency || 'JOD';
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          merchant_id: merchantId,
          customer_id: user?.id,
          customer_name: orderForm.name.trim(),
          customer_phone: orderForm.phone.trim(),
          customer_notes: orderForm.notes?.trim() || null,
          total_amount: merchantGroup.total,
          currency: orderCurrency,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = merchantGroup.items.map(item => ({
        order_id: order.id,
        item_id: item.id,
        item_title: item.title,
        item_price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Fetch merchant contact info
      const { data: merchantData } = await supabase
        .rpc('get_merchant_public_info', { merchant_ids: [merchantId] });

      const merchantInfo = merchantData?.[0];
      setConfirmedMerchant({
        name: merchantGroup.merchant_name,
        phone: merchantInfo?.phone || null,
        whatsapp: merchantInfo?.whatsapp_number || null,
      });

      // Clear merchant items from cart
      clearMerchantItems(merchantId);
      setOrderSuccess(true);

      toast({
        title: t('cart.orderSent'),
        description: `${t('cart.willContact')} ${merchantGroup.merchant_name} ${t('cart.soon')}`,
      });

      // Reset form
      setOrderForm({ name: '', phone: '', notes: '' });
      setErrors({});

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: t('common.error'),
        description: t('cart.orderFailed'),
        variant: 'destructive',
      });
    }

    setSubmitting(false);
  };

  const ArrowIcon = language === 'ar' ? ArrowRight : ArrowLeft;

  if (orderSuccess && items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="py-12">
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{t('cart.orderSuccess')}</h2>
              <p className="text-muted-foreground mb-4">
                {t('cart.merchantWillContact')}
              </p>
              
              {/* Merchant Contact Info */}
              {confirmedMerchant && (
                <div className="bg-muted rounded-lg p-4 mb-6 text-start">
                  <h3 className="font-semibold mb-3 text-center">{t('cart.contactMerchant')}</h3>
                  <p className="text-sm text-muted-foreground mb-3 text-center">
                    {confirmedMerchant.name}
                  </p>
                  <div className="flex gap-2 justify-center">
                    {confirmedMerchant.phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`tel:${confirmedMerchant.phone}`, '_self')}
                        className="flex-1"
                      >
                        <Phone className="h-4 w-4 mx-1" />
                        {t('cart.call')}
                      </Button>
                    )}
                    {confirmedMerchant.whatsapp && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const cleanPhone = confirmedMerchant.whatsapp!.replace(/\D/g, '');
                          window.open(`https://wa.me/${cleanPhone}`, '_blank');
                        }}
                        className="flex-1 bg-success hover:bg-success/90"
                      >
                        <MessageCircle className="h-4 w-4 mx-1" />
                        {t('cart.whatsapp')}
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              <Button asChild>
                <Link to="/browse">{t('cart.continueShopping')}</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(groupedItems).map(([merchantId, group]) => (
              <Card key={merchantId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    {group.merchant_name}
                  </CardTitle>
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
          </div>

          {/* Order Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{t('cart.orderData')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('cart.name')} *</Label>
                  <Input
                    id="name"
                    placeholder={t('cart.namePlaceholder')}
                    value={orderForm.name}
                    onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                    maxLength={200}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('cart.phone')} *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+962 7XX XXX XXX"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    maxLength={20}
                    dir="ltr"
                  />
                  <p className="text-xs text-muted-foreground">{t('cart.acceptsPhones')}</p>
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{t('cart.notes')}</Label>
                  <Textarea
                    id="notes"
                    placeholder={t('cart.notesPlaceholder')}
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                    rows={3}
                    maxLength={500}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>{t('cart.total')}:</span>
                    <span className="text-primary">
                      {getTotal().toFixed(2)} {items[0]?.currency || 'د.أ'}
                    </span>
                  </div>

                  {/* Login prompt for guests */}
                  {!user && (
                    <Card className="border-primary/30 bg-primary/5">
                      <CardContent className="py-4 text-center space-y-3">
                        <p className="text-sm font-medium">{t('cart.loginToOrder')}</p>
                        <p className="text-xs text-muted-foreground">{t('cart.loginToContinue')}</p>
                        <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                          <Link to="/auth?type=customer">{t('cart.loginNow')}</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Order buttons - only show when logged in */}
                  {user && Object.entries(groupedItems).map(([merchantId, group]) => (
                    <Button
                      key={merchantId}
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleSubmitOrder(merchantId)}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mx-2 h-4 w-4 animate-spin" />
                          {t('cart.sending')}
                        </>
                      ) : (
                        `${t('cart.sendOrder')} ${group.merchant_name}`
                      )}
                    </Button>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  {t('cart.merchantContact')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;