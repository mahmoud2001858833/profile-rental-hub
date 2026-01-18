import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, Phone, MessageCircle, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

interface OrderItem {
  id: string;
  item_title: string;
  item_price: number;
  quantity: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_notes: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'جديد', color: 'bg-yellow-500', icon: <Clock className="h-3 w-3" /> },
  confirmed: { label: 'مؤكد', color: 'bg-blue-500', icon: <CheckCircle className="h-3 w-3" /> },
  completed: { label: 'مكتمل', color: 'bg-green-500', icon: <CheckCircle className="h-3 w-3" /> },
  cancelled: { label: 'ملغي', color: 'bg-red-500', icon: <XCircle className="h-3 w-3" /> },
};

const OrdersManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('merchant_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الطلبات',
        variant: 'destructive',
      });
    } else {
      setOrders(data || []);
    }
    setLoading(false);
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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة الطلب',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'تم التحديث', description: 'تم تحديث حالة الطلب' });
      fetchOrders();
    }
  };

  const openWhatsApp = (phone: string, orderDetails: string) => {
    const message = encodeURIComponent(`مرحباً، بخصوص طلبك:\n${orderDetails}`);
    window.open(`https://wa.me/966${phone.slice(1)}?text=${message}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">الطلبات ({orders.length})</h3>
        <p className="text-sm text-muted-foreground">إدارة طلبات العملاء</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="font-semibold mb-2">لا توجد طلبات</h4>
            <p className="text-sm text-muted-foreground">ستظهر الطلبات هنا عندما يطلب العملاء منتجاتك</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            return (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{order.customer_name}</h4>
                        <Badge className={`${status.color} text-white gap-1`}>
                          {status.icon}
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                      <p className="text-primary font-bold mt-1">{order.total_amount.toFixed(2)} ر.س</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">جديد</SelectItem>
                          <SelectItem value="confirmed">مؤكد</SelectItem>
                          <SelectItem value="completed">مكتمل</SelectItem>
                          <SelectItem value="cancelled">ملغي</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          asChild
                        >
                          <a href={`tel:${order.customer_phone}`}>
                            <Phone className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 text-green-600"
                          onClick={() => openWhatsApp(order.customer_phone, `الإجمالي: ${order.total_amount.toFixed(2)} ر.س`)}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">بيانات العميل</h4>
                <p className="text-sm">الاسم: {selectedOrder.customer_name}</p>
                <p className="text-sm">الجوال: {selectedOrder.customer_phone}</p>
                {selectedOrder.customer_notes && (
                  <p className="text-sm">ملاحظات: {selectedOrder.customer_notes}</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">المنتجات</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.item_title} × {item.quantity}</span>
                      <span className="font-medium">{(item.item_price * item.quantity).toFixed(2)} ر.س</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>الإجمالي:</span>
                  <span className="text-primary">{selectedOrder.total_amount.toFixed(2)} ر.س</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  asChild
                >
                  <a href={`tel:${selectedOrder.customer_phone}`}>
                    <Phone className="ml-2 h-4 w-4" />
                    اتصال
                  </a>
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => openWhatsApp(
                    selectedOrder.customer_phone,
                    selectedOrder.items?.map(i => `${i.item_title} × ${i.quantity}`).join('\n') + `\nالإجمالي: ${selectedOrder.total_amount.toFixed(2)} ر.س`
                  )}
                >
                  <MessageCircle className="ml-2 h-4 w-4" />
                  واتساب
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManager;
