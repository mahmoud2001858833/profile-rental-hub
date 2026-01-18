import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useCart, CartItem } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, Loader2, CheckCircle } from 'lucide-react';
import { z } from 'zod';

const orderSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب').max(200),
  phone: z.string().regex(/^05\d{8}$/, 'رقم الجوال غير صحيح (05xxxxxxxx)'),
  notes: z.string().max(500).optional(),
});

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearMerchantItems, getTotal } = useCart();
  const { toast } = useToast();
  const [orderForm, setOrderForm] = useState({ name: '', phone: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

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
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          merchant_id: merchantId,
          customer_name: orderForm.name.trim(),
          customer_phone: orderForm.phone.trim(),
          customer_notes: orderForm.notes?.trim() || null,
          total_amount: merchantGroup.total,
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

      // Clear merchant items from cart
      clearMerchantItems(merchantId);
      setOrderSuccess(true);

      toast({
        title: 'تم إرسال الطلب',
        description: `سيتواصل معك ${merchantGroup.merchant_name} قريباً`,
      });

      // Reset form
      setOrderForm({ name: '', phone: '', notes: '' });
      setErrors({});

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إرسال الطلب، حاول مرة أخرى',
        variant: 'destructive',
      });
    }

    setSubmitting(false);
  };

  if (orderSuccess && items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="py-12">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">تم إرسال طلبك بنجاح!</h2>
              <p className="text-muted-foreground mb-6">
                سيتواصل معك التاجر قريباً لتأكيد الطلب
              </p>
              <Button asChild>
                <Link to="/shop">متابعة التسوق</Link>
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
              <h2 className="text-xl font-bold mb-2">السلة فارغة</h2>
              <p className="text-muted-foreground mb-6">لم تضف أي منتجات بعد</p>
              <Button asChild>
                <Link to="/shop">تصفح المنتجات</Link>
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
            <Link to="/shop">
              <ArrowRight className="h-4 w-4 ml-1" />
              متابعة التسوق
            </Link>
          </Button>
        </div>

        <h1 className="text-2xl font-bold mb-6">سلة التسوق</h1>

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
                        <h4 className="font-semibold truncate">{item.title}</h4>
                        <p className="text-primary font-bold">{item.price.toFixed(2)} ر.س</p>
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
                            className="h-7 w-7 text-destructive mr-auto"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold">{(item.price * item.quantity).toFixed(2)} ر.س</p>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-center justify-between font-bold">
                    <span>المجموع:</span>
                    <span className="text-primary text-lg">{group.total.toFixed(2)} ر.س</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>بيانات الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم *</Label>
                  <Input
                    id="name"
                    placeholder="اسمك الكامل"
                    value={orderForm.name}
                    onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                    maxLength={200}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الجوال *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="05xxxxxxxx"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    maxLength={10}
                    dir="ltr"
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    placeholder="ملاحظات إضافية للطلب..."
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                    rows={3}
                    maxLength={500}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>الإجمالي:</span>
                    <span className="text-primary">{getTotal().toFixed(2)} ر.س</span>
                  </div>

                  {Object.entries(groupedItems).map(([merchantId, group]) => (
                    <Button
                      key={merchantId}
                      className="w-full"
                      onClick={() => handleSubmitOrder(merchantId)}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري الإرسال...
                        </>
                      ) : (
                        `إرسال طلب لـ ${group.merchant_name}`
                      )}
                    </Button>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  سيتواصل معك التاجر لتأكيد الطلب وترتيب الدفع والتوصيل
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
