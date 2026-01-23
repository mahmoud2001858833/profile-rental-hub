import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { 
  Loader2, Package, LogOut, User, ShoppingBag, 
  Eye, Clock, CheckCircle, XCircle, Truck, Phone, MessageCircle 
} from 'lucide-react';

interface CustomerProfile {
  display_name: string | null;
  phone: string;
}

interface OrderItem {
  id: string;
  item_title: string;
  item_price: number;
  quantity: number;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  merchant_id: string;
  customer_notes: string | null;
  items?: OrderItem[];
  merchant_info?: {
    display_name: string;
    avatar_url: string | null;
    page_slug?: string | null;
    user_id?: string;
    whatsapp_number?: string | null;
  };
}

const Customer = () => {
  const navigate = useNavigate();
  const { user, loading, signOut, userType } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // Extract phone from user email
  const userPhone = user?.email?.replace('.customer@phone.local', '').replace('@phone.local', '') || '';
  
  // Create profile object from user data immediately
  const profile: CustomerProfile = {
    display_name: displayName,
    phone: userPhone
  };

  const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode; step: number }> = {
    pending: { 
      label: t('customer.pending'), 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100',
      icon: <Clock className="h-4 w-4" />,
      step: 1
    },
    confirmed: { 
      label: t('customer.confirmed'), 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      icon: <CheckCircle className="h-4 w-4" />,
      step: 2
    },
    completed: { 
      label: t('customer.completed'), 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      icon: <Truck className="h-4 w-4" />,
      step: 3
    },
    cancelled: { 
      label: t('customer.cancelled'), 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      icon: <XCircle className="h-4 w-4" />,
      step: 0
    },
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?type=customer');
    }
    if (!loading && userType === 'merchant') {
      navigate('/dashboard');
    }
  }, [user, loading, userType, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfileData();
      fetchOrders();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    // If profile exists, update display name
    if (data) {
      setDisplayName(data.display_name || '');
    } else {
      // Create profile in background (truncate phone to 20 chars)
      const truncatedPhone = userPhone.substring(0, 20);
      await supabase
        .from('customer_profiles')
        .insert({
          user_id: user.id,
          phone: truncatedPhone,
          display_name: ''
        });
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);

    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (ordersData && ordersData.length > 0) {
        // Get unique merchant IDs
        const merchantIds = [...new Set(ordersData.map(o => o.merchant_id))];
        
        // Fetch merchant info
        const { data: merchantsData } = await supabase
          .rpc('get_merchant_public_info', { merchant_ids: merchantIds });

        // Map merchant info to orders
        const ordersWithMerchants = ordersData.map(order => ({
          ...order,
          merchant_info: merchantsData?.find((m: any) => m.user_id === order.merchant_id)
        }));

        setOrders(ordersWithMerchants);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }

    setLoadingOrders(false);
  };

  const fetchOrderItems = async (orderId: string) => {
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    return data || [];
  };

  const handleViewDetails = async (order: Order) => {
    const items = await fetchOrderItems(order.id);
    setSelectedOrder({ ...order, items });
    setDetailsOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from('customer_profiles')
      .update({ display_name: displayName })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: t('common.error'),
        description: t('customer.saveError'),
        variant: 'destructive',
      });
    } else {
      toast({ title: t('customer.saved'), description: t('customer.dataUpdated') });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const openWhatsApp = (phone: string) => {
    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Use ar-EG for Gregorian calendar instead of ar-SA which defaults to Hijri
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Progress bar component
  const OrderProgress = ({ status }: { status: string }) => {
    const currentStep = statusConfig[status]?.step || 0;
    const isCancelled = status === 'cancelled';

    if (isCancelled) {
      return (
        <div className="flex items-center justify-center py-2">
          <Badge className="bg-destructive/10 text-destructive gap-1">
            <XCircle className="h-3 w-3" />
            {t('customer.cancelled')}
          </Badge>
        </div>
      );
    }

    const steps = [
      { label: t('customer.pending'), step: 1 },
      { label: t('customer.confirmed'), step: 2 },
      { label: t('customer.completed'), step: 3 },
    ];

    return (
      <div className="w-full py-4">
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-4 left-0 right-0 h-1 bg-muted mx-8">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
          </div>
          
          {steps.map((s, index) => (
            <div key={s.step} className="flex flex-col items-center z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                currentStep >= s.step 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {currentStep > s.step ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  s.step
                )}
              </div>
              <span className={`text-xs mt-1 ${
                currentStep >= s.step ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t('customer.myAccount')}</h1>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mx-2 h-4 w-4" />
            {t('customer.logout')}
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('customer.profile')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('customer.name')}</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('customer.namePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('customer.phone')}</Label>
                <Input value={profile.phone} disabled dir="ltr" />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? t('customer.saving') : t('customer.save')}
              </Button>
            </CardContent>
          </Card>

          {/* Orders */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  {t('customer.myOrders')} ({orders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('customer.noOrders')}</p>
                    <Button asChild className="mt-4">
                      <Link to="/browse">{t('customer.browseProducts')}</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const status = statusConfig[order.status] || statusConfig.pending;
                      return (
                        <Card key={order.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              {/* Merchant Info */}
                              <div className="flex items-center gap-3">
                                {order.merchant_info?.avatar_url ? (
                                  <img 
                                    src={order.merchant_info.avatar_url} 
                                    alt={order.merchant_info.display_name || ''} 
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-6 w-6 text-primary" />
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-semibold">
                                    {order.merchant_info?.display_name || t('customer.merchant')}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(order.created_at)}
                                  </p>
                                </div>
                              </div>

                              {/* Status & Price */}
                              <div className="text-end">
                                <Badge className={`${status.bgColor} ${status.color} gap-1`}>
                                  {status.icon}
                                  {status.label}
                                </Badge>
                                <p className="text-primary font-bold mt-2">
                                  {order.total_amount.toFixed(2)} {t('common.currency')}
                                </p>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <OrderProgress status={order.status} />

                            {/* Actions */}
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleViewDetails(order)}
                              >
                                <Eye className="mx-1 h-4 w-4" />
                                {t('customer.viewDetails')}
                              </Button>
                              {order.merchant_info?.whatsapp_number && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-primary hover:text-primary/80"
                                  onClick={() => openWhatsApp(order.merchant_info!.whatsapp_number!)}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('customer.orderDetails')}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Merchant Info */}
              <div className="flex items-center gap-3 pb-3 border-b">
                {selectedOrder.merchant_info?.avatar_url ? (
                  <img 
                    src={selectedOrder.merchant_info.avatar_url} 
                    alt={selectedOrder.merchant_info.display_name || ''} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold">
                    {selectedOrder.merchant_info?.display_name || t('customer.merchant')}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
              </div>

              {/* Order Progress */}
              <OrderProgress status={selectedOrder.status} />

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-2">{t('customer.orderItems')}</h4>
                <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.item_title} × {item.quantity}</span>
                      <span className="font-medium">
                        {(item.item_price * item.quantity).toFixed(2)} {t('common.currency')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.customer_notes && (
                <div>
                  <h4 className="font-semibold mb-1">{t('customer.notes')}</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                    {selectedOrder.customer_notes}
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('customer.total')}:</span>
                  <span className="text-primary">
                    {selectedOrder.total_amount.toFixed(2)} {t('common.currency')}
                  </span>
                </div>
              </div>

              {/* Contact Merchant */}
              {selectedOrder.merchant_info?.whatsapp_number && (
                <Button
                  className="w-full"
                  onClick={() => openWhatsApp(selectedOrder.merchant_info!.whatsapp_number!)}
                >
                  <MessageCircle className="mx-2 h-4 w-4" />
                  {t('customer.contactMerchant')}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customer;
